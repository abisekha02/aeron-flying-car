"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useTransform, useMotionValue, animate } from "framer-motion";
import CarTextOverlays from "./CarTextOverlays";
import { ChevronDown, Gauge, Plane, Radio, ShieldCheck, Zap, AlertCircle, Sparkles, Pause, Play, RotateCcw } from "lucide-react";

const TOTAL_FRAMES = 40;

// Autoplay timing
const HOLD_MS = 3000;       // how long the hero (headline + buttons) stays on screen before the flight starts
const LOOP_ANIMATION = false; // false = fly once and stay on the landed shot (with a Replay button); true = loop forever
const END_PROGRESS = LOOP_ANIMATION ? 1 : 0.985;
const DURATION_MS = 16000;  // length of one full flight (progress 0 -> 1), then it loops

interface TelemetryData {
  speed: number;
  altitude: number;
  thrust: number;
  phaseLabel: string;
  frameNumber: number;
  isAirborne: boolean;
}

const PHASES_TIMELINE = [
  { id: 1, label: "01 Runway", maxFrame: 5 },
  { id: 2, label: "02 Ascent", maxFrame: 13 },
  { id: 3, label: "03 Inversion", maxFrame: 19 },
  { id: 4, label: "04 Takeoff", maxFrame: 25 },
  { id: 5, label: "05 Flight Cruise", maxFrame: 34 },
  { id: 6, label: "06 Landing", maxFrame: 39 },
];

/**
 * Maps autoplay progress (0..1) to a FRACTIONAL frame position (0..39).
 * The integer part is the frame, the fraction is how far we are toward the next one,
 * which lets us cross-dissolve between neighbouring frames for smooth motion.
 *
 *  0.00 -> 0.10 : Hero (frame 0)
 *  0.10 -> 0.22 : Runway acceleration   (frames 0  -> 6)
 *  0.22 -> 0.36 : Curved ramp ascent    (frames 6  -> 14)
 *  0.36 -> 0.48 : Inverted 0-G arc      (frames 14 -> 20)
 *  0.48 -> 0.58 : Takeoff & flip upright(frames 20 -> 26)
 *  0.58 -> 0.85 : Sustained cruise      (frames 26 -> 34)
 *  0.85 -> 0.875: Quick dissolve at the scene cut (frame 34 -> 35); the flying shot and the
 *                 landed shot are very different pictures, so this must be short
 *  0.875-> 0.92 : Settle onto the pad   (frames 35 -> 39)
 *  0.92 -> 1.00 : Hold the landed shot, then fade to black and loop
 */
const FRAME_KEYS: Array<[number, number]> = [
  [0.10, 0],
  [0.22, 6],
  [0.36, 14],
  [0.48, 20],
  [0.58, 26],
  [0.85, 34],
  [0.865, 35],
  [0.90, 39],
];

function mapProgressToFrameFloat(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= FRAME_KEYS[0][0]) return FRAME_KEYS[0][1];
  for (let i = 1; i < FRAME_KEYS.length; i++) {
    const [p1, f1] = FRAME_KEYS[i];
    if (p <= p1) {
      const [p0, f0] = FRAME_KEYS[i - 1];
      return f0 + ((p - p0) / (p1 - p0)) * (f1 - f0);
    }
  }
  return TOTAL_FRAMES - 1;
}

export default function FlyingCarScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const blendRef = useRef<number>(0); // 0..1 cross-dissolve toward the next frame
  const lastFrameRef = useRef<number>(-1);
  const animFrameIdRef = useRef<number | null>(null);

  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasMissingFrames, setHasMissingFrames] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speed: 0,
    altitude: 0,
    thrust: 0,
    phaseLabel: "RUNWAY IDLE",
    frameNumber: 1,
    isAirborne: false,
  });

  // Autoplay progress (0..1). Nothing depends on page scrolling any more.
  const scrollYProgress = useMotionValue(0);
  const introFade = useMotionValue(0); // 1 -> 0 black fade-in after each loop restart
  const [isPlaying, setIsPlaying] = useState(true);
  const [canStart, setCanStart] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const holdUntilRef = useRef<number>(0);
  const visibleRef = useRef<boolean>(true);

  // Autoplay is already linear and smooth, so no spring is needed (a spring only added lag).
  const smoothProgress = scrollYProgress;

  // Start once frames are loaded (or after 5s at the latest so a slow network never blocks it)
  useEffect(() => {
    if (isLoaded) setCanStart(true);
  }, [isLoaded]);
  useEffect(() => {
    const t = setTimeout(() => setCanStart(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // Only play while the hero is on screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // AUTOPLAY DRIVER: advances progress over time and loops
  useEffect(() => {
    if (!canStart || !isPlaying || prefersReducedMotion) return;
    let raf: number;
    let last = performance.now();
    if (scrollYProgress.get() === 0) holdUntilRef.current = last + HOLD_MS;

    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      if (visibleRef.current && now >= holdUntilRef.current) {
        let next = scrollYProgress.get() + dt / DURATION_MS;
        if (next >= END_PROGRESS) {
          if (LOOP_ANIMATION) {
            // loop: snap back to the start (no fast reverse playback) and show the hero again
            smoothProgress.jump(0);
            next = 0;
            holdUntilRef.current = now + HOLD_MS;
            introFade.set(1);
            animate(introFade, 0, { duration: 0.9, ease: "easeOut" });
          } else {
            // play once: stop on the landed shot
            scrollYProgress.set(END_PROGRESS);
            setIsPlaying(false);
            setHasEnded(true);
            return;
          }
        }
        scrollYProgress.set(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [canStart, isPlaying, prefersReducedMotion, scrollYProgress, smoothProgress, introFade]);

  // Smooth end-of-loop: fade to black, cut back to the hero, fade up from black
  const endFade = useTransform(smoothProgress, [0.965, 0.995], [0, LOOP_ANIMATION ? 1 : 0]);
  const blackoutOpacity = useTransform([endFade, introFade], ([a, b]) =>
    Math.max(a as number, b as number)
  );

  // Hero overlay opacity (fades out cleanly before Phase 01 arrives)
  const heroOpacity = useTransform(smoothProgress, [0, 0.05, 0.10], [1, 0.4, 0]);
  const heroPointerEvents = useTransform(smoothProgress, (val) => (val < 0.07 ? "auto" : "none"));

  // Bottom sequence timeline bar opacity (fades in only AFTER Hero has faded out!)
  const timelineOpacity = useTransform(smoothProgress, [0.06, 0.12], [0, 1]);
  const timelinePointer = useTransform(timelineOpacity, (v) => (v > 0.5 ? "auto" : "none"));

  // Dynamic active phase index based on current frame
  const activePhaseIdx =
    activeFrame <= 5
      ? 0
      : activeFrame <= 13
      ? 1
      : activeFrame <= 19
      ? 2
      : activeFrame <= 25
      ? 3
      : activeFrame <= 34
      ? 4
      : 5;

  // Procedural canvas fallback if images are loading or missing
  const drawProceduralFallback = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      bgGrad.addColorStop(0, "#10131A");
      bgGrad.addColorStop(0.5, "#08090C");
      bgGrad.addColorStop(1, "#030304");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      const centerX = width / 2;

      // Draw glowing cyber runway grid
      ctx.strokeStyle = "rgba(255, 38, 56, 0.2)";
      ctx.lineWidth = 1;
      const horizonY = height * 0.52;
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + i * 20, horizonY);
        ctx.lineTo(centerX + i * 160, height);
        ctx.stroke();
      }

      // Red ramp trajectory path
      ctx.beginPath();
      ctx.moveTo(width * 0.1, height * 0.85);
      ctx.quadraticCurveTo(width * 0.5, height * 0.15, width * 0.9, height * 0.75);
      ctx.strokeStyle = "rgba(255, 38, 56, 0.6)";
      ctx.lineWidth = 3;
      ctx.stroke();

      const t = progress;
      const carX = width * 0.15 + t * (width * 0.7);
      const carY =
        height * 0.75 -
        Math.sin(t * Math.PI) * (height * 0.4) +
        (t > 0.4 && t < 0.6 ? Math.sin(t * 10) * 10 : 0);
      const angle = (t - 0.5) * 0.8;

      ctx.translate(carX, carY);
      ctx.rotate(angle);

      // Ion Thruster Plasma plume
      const thrusterGrad = ctx.createRadialGradient(-70, 0, 5, -110, 0, 45);
      thrusterGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      thrusterGrad.addColorStop(0.3, "rgba(86, 200, 255, 0.8)");
      thrusterGrad.addColorStop(0.8, "rgba(86, 200, 255, 0.15)");
      thrusterGrad.addColorStop(1, "transparent");
      ctx.fillStyle = thrusterGrad;
      ctx.beginPath();
      ctx.ellipse(-80, 0, 45 + progress * 20, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Silver sleek car body silhouette
      ctx.fillStyle = "#DCE1E8";
      ctx.shadowColor = "#56C8FF";
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.moveTo(-60, 10);
      ctx.lineTo(-45, -8);
      ctx.lineTo(-10, -18);
      ctx.lineTo(35, -12);
      ctx.lineTo(70, 4);
      ctx.lineTo(60, 14);
      ctx.lineTo(-50, 14);
      ctx.closePath();
      ctx.fill();

      // Panoramic Black Glass Canopy
      ctx.fillStyle = "#0D0E12";
      ctx.beginPath();
      ctx.moveTo(-30, -8);
      ctx.lineTo(-8, -17);
      ctx.lineTo(25, -11);
      ctx.lineTo(10, -7);
      ctx.closePath();
      ctx.fill();

      // Neon Red LED lightbar
      ctx.strokeStyle = "#FF2638";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#FF2638";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(60, 4);
      ctx.lineTo(68, 6);
      ctx.stroke();

      ctx.restore();

      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(220, 225, 232, 0.4)";
      ctx.fillText(
        `AERON SIMULATION // CRUISE FLIGHT VECTOR: ${(progress * 100).toFixed(1)}%`,
        30,
        height - 30
      );
    },
    []
  );

  /**
   * Render frame onto the canvas using full-bleed COVER algorithm.
   * Math.max(hRatio, vRatio) ensures zero black bars on left/right/top/bottom,
   * filling the entire viewport seamlessly.
   */
  const renderFrame = useCallback(
    (frameIndex: number, timeMs: number = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imagesRef.current[frameIndex];

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // FULL VIEWPORT COVER (Math.max) - Eliminates pillarboxes/letterboxes completely
        const hRatio = canvas.width / img.naturalWidth;
        const vRatio = canvas.height / img.naturalHeight;
        const ratio = Math.max(hRatio, vRatio);

        const drawWidth = img.naturalWidth * ratio;
        const drawHeight = img.naturalHeight * ratio;
        const centerShiftX = (canvas.width - drawWidth) / 2;
        let centerShiftY = (canvas.height - drawHeight) / 2;

        // In the airborne cruising phase (frames 26..34), add cinematic floating hover dynamics
        const isCruise = frameIndex >= 26 && frameIndex <= 34;
        if (isCruise) {
          const hoverY = Math.sin(timeMs * 0.002) * (canvas.height * 0.007);
          centerShiftY += hoverY;

          // Atmospheric electric-blue thruster ambient aura behind the vehicle
          const thrusterPulse = 0.85 + Math.sin(timeMs * 0.005) * 0.15;
          const auraGrad = ctx.createRadialGradient(
            canvas.width * 0.48,
            canvas.height * 0.52 + hoverY,
            10,
            canvas.width * 0.48,
            canvas.height * 0.52 + hoverY,
            canvas.width * 0.4
          );
          auraGrad.addColorStop(0, `rgba(86, 200, 255, ${0.16 * thrusterPulse})`);
          auraGrad.addColorStop(0.5, `rgba(86, 200, 255, ${0.05 * thrusterPulse})`);
          auraGrad.addColorStop(1, "transparent");
          ctx.fillStyle = auraGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
          img,
          0,
          0,
          img.naturalWidth,
          img.naturalHeight,
          centerShiftX,
          centerShiftY,
          drawWidth,
          drawHeight
        );

        // Cross-dissolve into the next frame so motion looks continuous instead of stepping
        const blend = blendRef.current;
        const nextImg = imagesRef.current[frameIndex + 1];
        if (blend > 0.01 && nextImg && nextImg.complete && nextImg.naturalWidth > 0) {
          ctx.globalAlpha = blend;
          ctx.drawImage(
            nextImg,
            0,
            0,
            nextImg.naturalWidth,
            nextImg.naturalHeight,
            centerShiftX,
            centerShiftY,
            drawWidth,
            drawHeight
          );
          ctx.globalAlpha = 1;
        }
      } else {
        drawProceduralFallback(
          ctx,
          canvas.width,
          canvas.height,
          frameIndex / (TOTAL_FRAMES - 1)
        );
      }
    },
    [drawProceduralFallback]
  );

  // Handle canvas sizing and high-DPI screens
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    renderFrame(currentFrameRef.current, performance.now());
  }, [renderFrame]);

  // Preload all 40 image frames
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let loaded = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/images/aeron/${i}.webp`;

      img.onload = () => {
        if (isCancelled) return;
        loaded++;
        setLoadedCount(loaded);
        // Force the browser to decode this frame now (not at the moment it is first shown)
        try {
          img.decode?.().catch(() => {});
          const warm = document.createElement("canvas");
          warm.width = 1;
          warm.height = 1;
          warm.getContext("2d")?.drawImage(img, 0, 0, 1, 1);
        } catch {}
        if (i - 1 === currentFrameRef.current || loaded === 1) {
          renderFrame(currentFrameRef.current, performance.now());
        }
        if (loaded >= TOTAL_FRAMES) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        if (!img.dataset.triedJpg) {
          img.dataset.triedJpg = "true";
          img.src = `/images/aeron/${i}.jpg`;
        } else {
          if (isCancelled) return;
          loaded++;
          setLoadedCount(loaded);
          setHasMissingFrames(true);
          if (loaded >= TOTAL_FRAMES) {
            setIsLoaded(true);
          }
        }
      };

      images.push(img);
    }

    imagesRef.current = images;

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      isCancelled = true;
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [handleResize, renderFrame]);

  // Continuously synchronize smooth spring progress with frame rendering & telemetry
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      const f = mapProgressToFrameFloat(latest);
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(f));
      blendRef.current = frameIndex >= TOTAL_FRAMES - 1 ? 0 : f - frameIndex;
      currentFrameRef.current = frameIndex;

      // Cheap path: same frame as before -> just repaint the canvas (no React re-render)
      if (frameIndex === lastFrameRef.current) {
        renderFrame(frameIndex, performance.now());
        return;
      }
      lastFrameRef.current = frameIndex;
      setActiveFrame(frameIndex);

      let speed = 0;
      let altitude = 0;
      let thrust = 0;
      let phaseLabel = "RUNWAY IDLE";
      let isAirborne = false;

      if (frameIndex <= 5) {
        phaseLabel = "RUNWAY ACCELERATION // GROUND MODE";
        speed = Math.round(80 + (frameIndex / 5) * 140);
        altitude = 0;
        thrust = Math.round(30 + (frameIndex / 5) * 45);
      } else if (frameIndex <= 13) {
        phaseLabel = "SUPERCHARGED RAMP ASCENT";
        const subT = (frameIndex - 6) / 7;
        speed = Math.round(220 + subT * 70);
        altitude = Math.round(10 + subT * 45);
        thrust = Math.round(75 + subT * 20);
      } else if (frameIndex <= 19) {
        phaseLabel = "INVERTED DYNAMICS // 0-G ARC";
        const subT = (frameIndex - 14) / 5;
        speed = Math.round(290 + subT * 30);
        altitude = Math.round(55 + subT * 25);
        thrust = 95;
      } else if (frameIndex <= 25) {
        phaseLabel = "LAUNCH ENVELOPE // AERO FLIP";
        const subT = (frameIndex - 20) / 5;
        speed = Math.round(320 + subT * 35);
        altitude = Math.round(80 + subT * 120);
        thrust = 100;
        isAirborne = true;
      } else if (frameIndex <= 34) {
        phaseLabel = "ION PROPULSION // STRATOSPHERIC CRUISE";
        speed = 380;
        altitude = 520;
        thrust = 94;
        isAirborne = true;
      } else {
        phaseLabel = "TERMINAL DESCENT // SMART RECOVERY";
        const subT = (frameIndex - 34) / 5;
        speed = Math.round(380 - subT * 260);
        altitude = Math.round(520 * (1 - subT));
        thrust = Math.round(80 - subT * 60);
      }

      setTelemetry({
        speed,
        altitude,
        thrust,
        phaseLabel,
        frameNumber: frameIndex + 1,
        isAirborne,
      });

      renderFrame(frameIndex, performance.now());
    });

    return () => unsubscribe();
  }, [smoothProgress, renderFrame]);

  // Ambient floating animation loop for sustained cruising flight
  useEffect(() => {
    let animId: number;
    const loop = (time: number) => {
      if (currentFrameRef.current >= 26 && currentFrameRef.current <= 34) {
        renderFrame(currentFrameRef.current, time);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderFrame]);

  // "Explore the experience": skip the hero hold and start the flight right away
  const scrollToSequence = () => {
    holdUntilRef.current = 0;
    setIsPlaying(true);
    if (scrollYProgress.get() < 0.11) {
      scrollYProgress.set(0.11);
      smoothProgress.jump(0.11);
    }
  };

  const scrollToEngineering = () => {
    const el = document.getElementById("engineering");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative h-screen min-h-[640px] w-full bg-[#050505]"
    >
      {/* Fullscreen Canvas Viewport (autoplay, no scroll pinning) */}
      <div
          className="relative h-full w-full overflow-hidden flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: "url(/images/aeron/1.webp)", backgroundColor: "#050505" }}
        >
        {/* Full-bleed HTML5 Canvas (edge-to-edge cover with Math.max) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
        />

        {/* Black fade used at the end of each loop (no hard jump back to the start) */}
        <motion.div
          style={{ opacity: blackoutOpacity }}
          className="absolute inset-0 bg-[#050505] pointer-events-none z-10"
        />

        {/* Ambient Glow Atmosphere Behind Canvas */}
        <div className="absolute inset-0 pointer-events-none bg-radial-glow from-electricBlue/10 via-crimson/5 to-transparent z-0 opacity-70" />

        {/* Loading HUD Bar if still preloading */}
        {!isLoaded && loadedCount < TOTAL_FRAMES && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-neonRed border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono tracking-[0.2em] text-white">
              INITIALIZING TELEMETRY // {Math.round((loadedCount / TOTAL_FRAMES) * 100)}%
            </span>
          </div>
        )}

        {/* Fallback frame notification (if any frames fail) */}
        {hasMissingFrames && (
          <div className="absolute top-20 right-6 z-40 p-3 rounded-xl bg-black/90 border border-yellow-500/30 text-yellow-400 text-xs flex items-center gap-2.5 max-w-sm backdrop-blur-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-yellow-400" />
            <div>
              <p className="font-semibold uppercase tracking-wider text-[11px]">Notice: Fallback Active</p>
              <p className="text-[10px] text-silver/80">
                Frames placed at <code className="text-white">public/images/aeron/[1-40].webp</code>
              </p>
            </div>
          </div>
        )}

        {/* HERO SECTION OVERLAY (Active at the start of scroll, cleanly crossfades out before Phase 1) */}
        <motion.div
          style={{ opacity: heroOpacity, pointerEvents: heroPointerEvents as unknown as "auto" | "none" }}
          className="absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-10 md:p-16 max-w-7xl mx-auto w-full pointer-events-none"
        >
          {/* TOP: navbar spacer + badge + headline (stays up) */}
          <div className="pt-16 sm:pt-20 max-w-3xl space-y-5 pointer-events-auto">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-neonRed animate-pulse shadow-[0_0_8px_#FF2638]" />
              <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-neutral-300">
                Project Stratos 01 // Autonomous Dual-Mode Concept
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-[0.88] drop-shadow-2xl">
              THE SKY <br />
              <span className="bg-gradient-to-r from-white via-silver to-neutral-400 bg-clip-text text-transparent">
                IS YOURS.
              </span>
            </h1>
          </div>

          {/* BOTTOM: all other text + buttons move down, leaving the car visible in the middle */}
          <div className="space-y-5 pointer-events-auto">
            <p className="text-base sm:text-lg md:text-xl text-silver/85 font-light tracking-wide max-w-xl">
              A new dimension of motion. Blending supercar racetrack dynamics with unrestricted, zero-emission atmospheric flight.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={scrollToSequence}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-crimson to-neonRed text-white font-semibold text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,38,56,0.4)] hover:shadow-[0_0_40px_rgba(255,38,56,0.7)] transition-all duration-300 active:scale-95"
              >
                <span>EXPLORE THE EXPERIENCE</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </button>

              <button
                onClick={scrollToEngineering}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white font-semibold text-xs uppercase tracking-[0.2em] backdrop-blur-md transition-all duration-300 active:scale-95"
              >
                <span>DISCOVER THE VEHICLE</span>
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2.5 text-xs uppercase tracking-[0.18em] text-neutral-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-electricBlue shadow-[0_0_8px_#56C8FF]" />
                <span>Fluid 40-Frame Flight Transformation</span>
              </div>

              <button
                onClick={scrollToSequence}
                className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-silver/80 hover:text-white transition-colors"
              >
                <span>Scroll to launch</span>
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* SCROLLYTELLING TEXT OVERLAYS (Synchronized with smoothProgress, starting cleanly after Hero) */}
        <CarTextOverlays progress={smoothProgress} />

        {/* FLIGHT TELEMETRY HUD BAR (Sitting squarely over the covered canvas background) */}
        <div className="absolute top-20 right-4 sm:right-6 md:right-10 z-20 hidden sm:flex flex-col gap-2 pointer-events-none">
          <div className="glass-panel px-4 py-2.5 rounded-xl border border-white/10 font-mono text-[11px] text-silver space-y-1 shadow-2xl">
            <div className="flex items-center justify-between gap-4 text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Plane className={`w-3.5 h-3.5 ${telemetry.isAirborne ? "text-electricBlue animate-pulse" : "text-neutral-400"}`} />
                <span>FLIGHT TELEMETRY</span>
              </span>
              <span className="text-white font-semibold">
                FRAME {String(telemetry.frameNumber).padStart(2, "0")} / 40
              </span>
            </div>

            <div className="h-[1px] bg-white/10 my-1" />

            <div className="grid grid-cols-3 gap-3 text-center pt-1">
              <div>
                <p className="text-[9px] text-neutral-400">VELOCITY</p>
                <p className="text-sm font-bold text-white">
                  {telemetry.speed} <span className="text-[9px]">KM/H</span>
                </p>
              </div>
              <div>
                <p className="text-[9px] text-neutral-400">ALTITUDE</p>
                <p className="text-sm font-bold text-electricBlue">
                  {telemetry.altitude} <span className="text-[9px]">M</span>
                </p>
              </div>
              <div>
                <p className="text-[9px] text-neutral-400">THRUST</p>
                <p className="text-sm font-bold text-neonRed">
                  {telemetry.thrust}%
                </p>
              </div>
            </div>

            <div className="text-[9px] text-neutral-400 truncate pt-1 border-t border-white/5 flex items-center justify-between gap-2">
              <span className="truncate">{telemetry.phaseLabel}</span>
              {telemetry.isAirborne && (
                <span className="shrink-0 text-electricBlue flex items-center gap-1 font-bold">
                  <Sparkles className="w-2.5 h-2.5" /> AIRBORNE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SEQUENCE TIMELINE (Fades in ONLY AFTER Hero fades out - eliminates collisions!) */}
        <motion.div
          style={{ opacity: timelineOpacity }}
          className="absolute bottom-5 left-4 right-4 md:left-14 md:right-14 z-20 pointer-events-none"
        >
          {/* Dynamically highlighted timeline labels based on active phase */}
          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 uppercase tracking-wider">
            {PHASES_TIMELINE.map((phase, idx) => {
              const isActive = idx === activePhaseIdx;
              return (
                <span
                  key={phase.id}
                  className={`transition-colors duration-300 ${
                    isActive
                      ? "text-electricBlue font-bold drop-shadow-[0_0_8px_rgba(86,200,255,0.7)]"
                      : "text-neutral-500"
                  }`}
                >
                  {phase.label}
                </span>
              );
            })}
          </div>

          {/* Smooth progress bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              style={{ scaleX: smoothProgress, transformOrigin: "left" }}
              className="h-full bg-gradient-to-r from-neonRed via-white to-electricBlue"
            />
          </div>
        </motion.div>

        {/* Pause / play (autoplaying motion should always be pausable) */}
        <motion.button
          type="button"
          onClick={() => {
            if (hasEnded) {
              // Replay: restart the flight directly (skip the hero)
              setHasEnded(false);
              holdUntilRef.current = 0;
              lastFrameRef.current = -1;
              smoothProgress.jump(0.11);
              scrollYProgress.set(0.11);
              setIsPlaying(true);
            } else {
              setIsPlaying((v) => !v);
            }
          }}
          aria-label={hasEnded ? "Replay animation" : isPlaying ? "Pause animation" : "Play animation"}
          style={{ opacity: timelineOpacity, pointerEvents: timelinePointer }}
          className="absolute bottom-14 right-4 md:right-14 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-[10px] font-mono uppercase tracking-wider text-silver backdrop-blur-md transition-colors"
        >
          {hasEnded ? <RotateCcw className="w-3 h-3" /> : isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{hasEnded ? "Replay" : isPlaying ? "Pause" : "Play"}</span>
        </motion.button>

        {/* Accessibility Notice for Reduced Motion */}
        {prefersReducedMotion && (
          <div className="absolute bottom-16 right-6 z-20 px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 text-[10px] font-mono text-neutral-400">
            Reduced motion mode active
          </div>
        )}

        {/* Seamless bottom gradient bleed to handover smoothly into FlightTechnology */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#08090C] pointer-events-none z-10" />
      </div>
    </section>
  );
}