"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, motion, useTransform, useSpring } from "framer-motion";
import CarTextOverlays from "./CarTextOverlays";
import { ChevronDown, Gauge, Plane, Radio, ShieldCheck, Zap, AlertCircle, Sparkles } from "lucide-react";

const TOTAL_FRAMES = 40;

interface TelemetryData {
  speed: number;
  altitude: number;
  thrust: number;
  phaseLabel: string;
  frameNumber: number;
  isAirborne: boolean;
}

/**
 * Maps scroll progress (0..1) to frame index (0..39) with custom pacing:
 * - 0.00 -> 0.58 : Rapid 1-2 gesture transformation (runway -> ramp -> inversion -> flip upright into flight)
 * - 0.58 -> 0.85 : Sustained cruising flight with glowing thrusters (held so user can appreciate the flying car)
 * - 0.85 -> 1.00 : Smooth descent and landing
 */
function mapProgressToFrame(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));

  if (p <= 0.15) {
    // 0.00 -> 0.15 : Frames 0 -> 5 (Runway acceleration)
    const t = p / 0.15;
    return Math.min(5, Math.floor(t * 6));
  } else if (p <= 0.30) {
    // 0.15 -> 0.30 : Frames 6 -> 13 (Ramp ascent)
    const t = (p - 0.15) / 0.15;
    return Math.min(13, 6 + Math.floor(t * 8));
  } else if (p <= 0.44) {
    // 0.30 -> 0.44 : Frames 14 -> 19 (Inverted arc)
    const t = (p - 0.30) / 0.14;
    return Math.min(19, 14 + Math.floor(t * 6));
  } else if (p <= 0.58) {
    // 0.44 -> 0.58 : Frames 20 -> 25 (Takeoff & flip upright)
    const t = (p - 0.44) / 0.14;
    return Math.min(25, 20 + Math.floor(t * 6));
  } else if (p <= 0.85) {
    // 0.58 -> 0.85 : Frames 26 -> 34 (Full flight with illuminated thrusters - sustained appreciation plateau!)
    const t = (p - 0.58) / 0.27;
    return Math.min(34, 26 + Math.floor(t * 9));
  } else {
    // 0.85 -> 1.00 : Frames 35 -> 39 (Descent & runway landing)
    const t = (p - 0.85) / 0.15;
    return Math.min(39, 35 + Math.floor(t * 5));
  }
}

export default function FlyingCarScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasMissingFrames, setHasMissingFrames] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speed: 0,
    altitude: 0,
    thrust: 0,
    phaseLabel: "RUNWAY IDLE",
    frameNumber: 1,
    isAirborne: false,
  });

  // Track raw scroll progress across the compact 190vh section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Spring-smoothed progress for buttery 60/120fps motion across gestures
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 24,
    mass: 0.12,
    restDelta: 0.0001,
  });

  // Hero overlay opacity (fades as user initiates the first gesture)
  const heroOpacity = useTransform(smoothProgress, [0, 0.04, 0.12], [1, 0.5, 0]);
  const heroPointerEvents = useTransform(smoothProgress, (val) => (val < 0.08 ? "auto" : "none"));

  // Procedural canvas fallback if images are completely absent or loading
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

  // Render a specific frame onto the canvas with atmospheric hover physics during cruise
  const renderFrame = useCallback(
    (frameIndex: number, timeMs: number = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imagesRef.current[frameIndex];

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Aspect-ratio preserving contain logic
        const hRatio = canvas.width / img.naturalWidth;
        const vRatio = canvas.height / img.naturalHeight;
        const ratio = Math.min(hRatio, vRatio);

        let centerShiftX = (canvas.width - img.naturalWidth * ratio) / 2;
        let centerShiftY = (canvas.height - img.naturalHeight * ratio) / 2;

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
            canvas.width * 0.35
          );
          auraGrad.addColorStop(0, `rgba(86, 200, 255, ${0.14 * thrusterPulse})`);
          auraGrad.addColorStop(0.5, `rgba(86, 200, 255, ${0.04 * thrusterPulse})`);
          auraGrad.addColorStop(1, "transparent");
          ctx.fillStyle = auraGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(
          img,
          0,
          0,
          img.naturalWidth,
          img.naturalHeight,
          centerShiftX,
          centerShiftY,
          img.naturalWidth * ratio,
          img.naturalHeight * ratio
        );
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
        if (loaded === 1) {
          renderFrame(0, performance.now());
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
      const frameIndex = mapProgressToFrame(latest);
      currentFrameRef.current = frameIndex;

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
      // Re-render only if in flight mode to provide living atmospheric hover
      if (currentFrameRef.current >= 26 && currentFrameRef.current <= 34) {
        renderFrame(currentFrameRef.current, time);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderFrame]);

  const scrollToSequence = () => {
    if (containerRef.current) {
      const top = containerRef.current.offsetTop;
      const height = containerRef.current.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: top + height * 0.65, // Scrolls directly to the majestic flying car cruising scene!
        behavior: "smooth",
      });
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
      className="relative h-[190vh] w-full bg-[#050505]"
    >
      {/* Sticky Fullscreen Canvas Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
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

        {/* HERO SECTION OVERLAY (Active at the start of scroll) */}
        <motion.div
          style={{ opacity: heroOpacity, pointerEvents: heroPointerEvents as unknown as "auto" | "none" }}
          className="absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-12 md:p-16 max-w-7xl mx-auto w-full"
        >
          {/* Top spacer for navbar */}
          <div className="pt-20" />

          {/* Central Hero Content */}
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-neonRed animate-pulse shadow-[0_0_8px_#FF2638]" />
              <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-neutral-300">
                Project Stratos 01 // Autonomous Dual-Mode Concept
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight text-white leading-[0.88] drop-shadow-2xl">
              THE SKY <br />
              <span className="bg-gradient-to-r from-white via-silver to-neutral-400 bg-clip-text text-transparent">
                IS YOURS.
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-silver/80 font-light tracking-wide max-w-xl">
              A new dimension of motion. Blending supercar racetrack dynamics with unrestricted, zero-emission atmospheric flight.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
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
          </div>

          {/* Bottom Hero Scroll Prompt */}
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-neutral-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-electricBlue shadow-[0_0_8px_#56C8FF]" />
              <span>Fluid 40-Frame Flight Transformation</span>
            </div>

            <button
              onClick={scrollToSequence}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-silver/70 hover:text-white transition-colors"
            >
              <span>Scroll to launch</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </motion.div>

        {/* SCROLLYTELLING TEXT OVERLAYS (Synchronized with smoothProgress) */}
        <CarTextOverlays progress={smoothProgress} />

        {/* FLIGHT TELEMETRY HUD BAR (Floating at the top right) */}
        <div className="absolute top-20 right-4 sm:right-6 md:right-12 z-20 hidden sm:flex flex-col gap-2 pointer-events-none">
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

        {/* Bottom Sequence Progress Bar */}
        <div className="absolute bottom-4 left-4 right-4 md:left-14 md:right-14 z-20 pointer-events-none">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1.5 uppercase tracking-wider">
            <span>01 Runway</span>
            <span>02 Ascent</span>
            <span>03 Inversion</span>
            <span>04 Takeoff</span>
            <span className="text-electricBlue font-bold">05 Cruise Flight</span>
            <span>06 Landing</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              style={{ scaleX: smoothProgress, transformOrigin: "left" }}
              className="h-full bg-gradient-to-r from-neonRed via-white to-electricBlue"
            />
          </div>
        </div>

        {/* Accessibility Notice for Reduced Motion */}
        {prefersReducedMotion && (
          <div className="absolute bottom-16 right-6 z-20 px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 text-[10px] font-mono text-neutral-400">
            Reduced motion mode active
          </div>
        )}
      </div>
    </section>
  );
}
