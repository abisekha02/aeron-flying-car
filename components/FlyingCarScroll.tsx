"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useTransform, useMotionValue, animate } from "framer-motion";
import CarTextOverlays from "./CarTextOverlays";
import {
  ChevronDown,
  Gauge,
  Plane,
  Radio,
  ShieldCheck,
  Zap,
  AlertCircle,
  Sparkles,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  FastForward,
} from "lucide-react";
import { sound } from "../utils/audio";

const TOTAL_FRAMES = 40;

// Default autoplay timing (punchy, kinetic, cinematic)
const HOLD_MS = 2500;       // initial hero view hold
const BASE_DURATION_MS = 8500; // total flight sequence time

interface TelemetryData {
  speed: number;
  altitude: number;
  thrust: number;
  pitch: number;
  phaseLabel: string;
  frameNumber: number;
  isAirborne: boolean;
}

const PHASES_TIMELINE = [
  { id: 1, label: "01 Runway", range: [0, 5] },
  { id: 2, label: "02 Ascent", range: [6, 13] },
  { id: 3, label: "03 Inversion", range: [14, 19] },
  { id: 4, label: "04 Takeoff", range: [20, 25] },
  { id: 5, label: "05 Flight Cruise", range: [26, 34] },
  { id: 6, label: "06 Landing", range: [35, 39] },
];

/**
 * Maps autoplay progress (0..1) to a fractional frame position (0..39).
 * Non-linear kinetic curve:
 *  0.00 -> 0.10 : Hero hold (frame 0)
 *  0.10 -> 0.22 : Runway acceleration (frames 0 -> 6)
 *  0.22 -> 0.38 : Curved ramp ascent (frames 6 -> 14)
 *  0.38 -> 0.50 : 0-G loop & inverted arc (frames 14 -> 20)
 *  0.50 -> 0.62 : Launch off ramp & aero flip (frames 20 -> 26)
 *  0.62 -> 0.85 : Stratospheric Cruise flight (frames 26 -> 34) - held long enough to appreciate!
 *  0.85 -> 0.92 : Touchdown on landing pad (frames 35 -> 39)
 *  0.92 -> 1.00 : Landed presentation hold
 */
const FRAME_KEYS: Array<[number, number]> = [
  [0.10, 0],
  [0.22, 6],
  [0.38, 14],
  [0.50, 20],
  [0.62, 26],
  [0.85, 34],
  [0.87, 35],
  [0.92, 39],
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
  const lastFrameRef = useRef<number>(-1);
  const isScrubbingRef = useRef<boolean>(false);

  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasMissingFrames, setHasMissingFrames] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speed: 0,
    altitude: 0,
    thrust: 0,
    pitch: 0,
    phaseLabel: "RUNWAY IDLE",
    frameNumber: 1,
    isAirborne: false,
  });

  const scrollYProgress = useMotionValue(0);
  const introFade = useMotionValue(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [canStart, setCanStart] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const holdUntilRef = useRef<number>(0);
  const visibleRef = useRef<boolean>(true);

  const smoothProgress = scrollYProgress;

  // Sound trigger flags to avoid repeated audio
  const soundPlayedRef = useRef<{ takeoff: boolean; landing: boolean }>({
    takeoff: false,
    landing: false,
  });

  useEffect(() => {
    if (isLoaded) setCanStart(true);
  }, [isLoaded]);
  useEffect(() => {
    const t = setTimeout(() => setCanStart(true), 3500);
    return () => clearTimeout(t);
  }, []);

  // Viewport intersection
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

  // AUTOPLAY ENGINE
  useEffect(() => {
    if (!canStart || !isPlaying || prefersReducedMotion) return;
    let raf: number;
    let last = performance.now();
    if (scrollYProgress.get() === 0) holdUntilRef.current = last + HOLD_MS;

    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;

      if (visibleRef.current && now >= holdUntilRef.current && !isScrubbingRef.current) {
        const speedMultiplier = playbackSpeed;
        const currentP = scrollYProgress.get();
        let next = currentP + (dt / (BASE_DURATION_MS / speedMultiplier));

        // Audio trigger at takeoff (around progress 0.50)
        if (next >= 0.50 && !soundPlayedRef.current.takeoff) {
          soundPlayedRef.current.takeoff = true;
          sound.playThrusterBurst();
        }

        if (next >= 0.985) {
          scrollYProgress.set(0.985);
          setIsPlaying(false);
          setHasEnded(true);
          return;
        }

        try {
          scrollYProgress.set(next);
        } catch (err) {
          console.error("[AERON] frame error:", err);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [canStart, isPlaying, prefersReducedMotion, scrollYProgress, playbackSpeed]);

  // Overlay transforms
  const heroOpacity = useTransform(smoothProgress, [0, 0.05, 0.10], [1, 0.4, 0]);
  const heroPointerEvents = useTransform(smoothProgress, (val) => (val < 0.07 ? "auto" : "none"));
  const timelineOpacity = useTransform(smoothProgress, [0.06, 0.12], [0, 1]);
  const timelinePointer = useTransform(timelineOpacity, (v) => (v > 0.5 ? "auto" : "none"));

  // Dynamic phase index
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

  /**
   * Razor-sharp full-bleed Canvas Render
   * Eliminates ghosting by cleanly drawing the current target frame.
   * Enhances airborne Cruise with 60fps micro-hover and thruster glow.
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

        // Full viewport cover algorithm
        const hRatio = canvas.width / img.naturalWidth;
        const vRatio = canvas.height / img.naturalHeight;
        const ratio = Math.max(hRatio, vRatio);

        const drawWidth = img.naturalWidth * ratio;
        const drawHeight = img.naturalHeight * ratio;
        const centerShiftX = (canvas.width - drawWidth) / 2;
        let centerShiftY = (canvas.height - drawHeight) / 2;

        // In Cruise Flight (frames 26-34), add 60fps smooth kinetic float & volumetric thruster plasma
        const isCruise = frameIndex >= 26 && frameIndex <= 34;
        if (isCruise) {
          const hoverY = Math.sin(timeMs * 0.002) * (canvas.height * 0.008);
          centerShiftY += hoverY;

          // Atmospheric electric-blue thruster ambient aura
          const pulse = 0.85 + Math.sin(timeMs * 0.006) * 0.15;
          const aura = ctx.createRadialGradient(
            canvas.width * 0.46,
            canvas.height * 0.52 + hoverY,
            20,
            canvas.width * 0.46,
            canvas.height * 0.52 + hoverY,
            canvas.width * 0.35
          );
          aura.addColorStop(0, `rgba(86, 200, 255, ${0.18 * pulse})`);
          aura.addColorStop(0.4, `rgba(86, 200, 255, ${0.06 * pulse})`);
          aura.addColorStop(1, "transparent");
          ctx.fillStyle = aura;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw current crisp frame (NO ghosting overlay!)
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

        // Subtle high-speed particles during takeoff & cruise
        if (frameIndex >= 10 && frameIndex <= 34) {
          ctx.save();
          ctx.strokeStyle = "rgba(86, 200, 255, 0.25)";
          ctx.lineWidth = 1.2;
          const pCount = 10;
          for (let p = 0; p < pCount; p++) {
            const seed = (timeMs * 0.8 + p * 123) % canvas.width;
            const py = (p * 73 + timeMs * 0.05) % canvas.height;
            const pLen = 40 + (p % 4) * 20;
            ctx.beginPath();
            ctx.moveTo(seed, py);
            ctx.lineTo(seed + pLen, py);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    },
    []
  );

  // Resize handler with high-DPI scaling
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    renderFrame(currentFrameRef.current, performance.now());
  }, [renderFrame]);

  // Preload all 40 image frames
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
        try {
          img.decode?.().catch(() => {});
        } catch {}

        if (i - 1 === currentFrameRef.current || loaded === 1) {
          renderFrame(currentFrameRef.current, performance.now());
        }
        if (loaded >= TOTAL_FRAMES) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        if (isCancelled) return;
        loaded++;
        setLoadedCount(loaded);
        setHasMissingFrames(true);
        if (loaded >= TOTAL_FRAMES) {
          setIsLoaded(true);
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
    };
  }, [handleResize, renderFrame]);

  // Synchronize progress value with frame rendering & real-time telemetry
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      const f = mapProgressToFrameFloat(latest);
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.round(f));
      currentFrameRef.current = frameIndex;

      if (frameIndex !== lastFrameRef.current) {
        lastFrameRef.current = frameIndex;
        setActiveFrame(frameIndex);

        let speed = 0;
        let altitude = 0;
        let thrust = 0;
        let pitch = 0;
        let phaseLabel = "RUNWAY IDLE";
        let isAirborne = false;

        if (frameIndex <= 5) {
          phaseLabel = "TARMAC ACCELERATION // VECTOR DRIVE";
          speed = Math.round(80 + (frameIndex / 5) * 140);
          altitude = 0;
          thrust = Math.round(30 + (frameIndex / 5) * 45);
          pitch = 0;
        } else if (frameIndex <= 13) {
          phaseLabel = "SUPERCHARGED RAMP ASCENT";
          const subT = (frameIndex - 6) / 7;
          speed = Math.round(220 + subT * 70);
          altitude = Math.round(10 + subT * 45);
          thrust = Math.round(75 + subT * 20);
          pitch = Math.round(15 + subT * 30);
        } else if (frameIndex <= 19) {
          phaseLabel = "INVERTED 0-G ROTATIONAL ARC";
          const subT = (frameIndex - 14) / 5;
          speed = Math.round(290 + subT * 30);
          altitude = Math.round(55 + subT * 25);
          thrust = 95;
          pitch = 180;
        } else if (frameIndex <= 25) {
          phaseLabel = "LAUNCH RELEASE // AERODYNAMIC FLIP";
          const subT = (frameIndex - 20) / 5;
          speed = Math.round(320 + subT * 40);
          altitude = Math.round(80 + subT * 140);
          thrust = 100;
          pitch = Math.round(180 - subT * 175);
          isAirborne = true;
        } else if (frameIndex <= 34) {
          phaseLabel = "STRATOSPHERIC CRUISE // ION PROPULSION";
          speed = 380;
          altitude = 520;
          thrust = 94;
          pitch = 5;
          isAirborne = true;
        } else {
          phaseLabel = "TERMINAL DESCENT & TOUCHDOWN";
          const subT = (frameIndex - 35) / 4;
          speed = Math.round(380 - subT * 300);
          altitude = Math.round(520 * (1 - subT));
          thrust = Math.round(80 - subT * 60);
          pitch = -4;
        }

        setTelemetry({
          speed,
          altitude,
          thrust,
          pitch,
          phaseLabel,
          frameNumber: frameIndex + 1,
          isAirborne,
        });
      }

      renderFrame(frameIndex, performance.now());
    });

    return () => unsubscribe();
  }, [smoothProgress, renderFrame]);

  // Ambient 60fps loop for Cruise flight micro-hover
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

  // Quick Action Buttons
  const startFlight = () => {
    sound.playClick();
    holdUntilRef.current = 0;
    setIsPlaying(true);
    setHasEnded(false);
    soundPlayedRef.current = { takeoff: false, landing: false };
    if (scrollYProgress.get() < 0.11) {
      scrollYProgress.set(0.11);
      smoothProgress.jump(0.11);
    }
  };

  const replayFlight = () => {
    sound.playClick();
    setHasEnded(false);
    holdUntilRef.current = 0;
    lastFrameRef.current = -1;
    soundPlayedRef.current = { takeoff: false, landing: false };
    smoothProgress.jump(0.11);
    scrollYProgress.set(0.11);
    setIsPlaying(true);
  };

  const scrollToEngineering = () => {
    sound.playClick();
    const el = document.getElementById("engineering");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative h-screen min-h-[660px] w-full bg-[#050505] overflow-hidden select-none"
    >
      {/* Background Frame 1 Poster as Fallback */}
      <div
        className="relative h-full w-full overflow-hidden flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url(/images/aeron/1.webp)", backgroundColor: "#050505" }}
      >
        {/* Full-bleed HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-radial-glow from-transparent via-black/20 to-black/80 z-10" />

        {/* Loading Progress */}
        {!isLoaded && loadedCount < TOTAL_FRAMES && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-3 shadow-2xl">
            <div className="w-4 h-4 border-2 border-neonRed border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono tracking-[0.2em] text-white">
              INITIALIZING TELEMETRY BUFFER // {Math.round((loadedCount / TOTAL_FRAMES) * 100)}%
            </span>
          </div>
        )}

        {/* HERO SECTION OVERLAY (Clean crossfade) */}
        <motion.div
          style={{ opacity: heroOpacity, pointerEvents: heroPointerEvents as unknown as "auto" | "none" }}
          className="absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-10 md:p-16 max-w-7xl mx-auto w-full pointer-events-none"
        >
          {/* Top Hero Headline */}
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

          {/* Bottom Hero CTAs */}
          <div className="space-y-5 pointer-events-auto">
            <p className="text-base sm:text-lg md:text-xl text-silver/85 font-light tracking-wide max-w-xl">
              A new dimension of motion. Blending supercar racetrack dynamics with unrestricted, zero-emission atmospheric flight.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={startFlight}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-crimson to-neonRed text-white font-semibold text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,38,56,0.4)] hover:shadow-[0_0_40px_rgba(255,38,56,0.7)] transition-all duration-300 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>LAUNCH CINEMATIC FLIGHT</span>
              </button>

              <button
                onClick={scrollToEngineering}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white font-semibold text-xs uppercase tracking-[0.2em] backdrop-blur-md transition-all duration-300 active:scale-95"
              >
                <span>EXPLORE ARCHITECTURE</span>
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono">
              <div className="flex items-center gap-2.5 text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-electricBlue shadow-[0_0_8px_#56C8FF]" />
                <span>High-Precision 40-Frame Vector Sequence</span>
              </div>

              <button
                onClick={startFlight}
                className="flex items-center gap-2 text-silver/80 hover:text-white transition-colors uppercase tracking-wider"
              >
                <span>Launch experience</span>
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* SCROLLYTELLING TEXT OVERLAYS */}
        <CarTextOverlays progress={smoothProgress} />

        {/* HIGH-PRECISION FLIGHT TELEMETRY HUD */}
        <div className="absolute top-20 right-4 sm:right-6 md:right-10 z-20 hidden sm:flex flex-col gap-2 pointer-events-none">
          <div className="glass-panel px-4 py-3 rounded-2xl border border-white/15 font-mono text-[11px] text-silver space-y-2 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Plane className={`w-3.5 h-3.5 ${telemetry.isAirborne ? "text-electricBlue animate-pulse" : "text-neutral-400"}`} />
                <span>FLIGHT TELEMETRY</span>
              </span>
              <span className="text-white font-semibold">
                FRAME {String(telemetry.frameNumber).padStart(2, "0")} / 40
              </span>
            </div>

            <div className="h-[1px] bg-white/10" />

            <div className="grid grid-cols-4 gap-3 text-center pt-0.5">
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
              <div>
                <p className="text-[9px] text-neutral-400">PITCH</p>
                <p className="text-sm font-bold text-silver">
                  {telemetry.pitch}°
                </p>
              </div>
            </div>

            <div className="text-[9px] text-neutral-400 truncate pt-1 border-t border-white/5 flex items-center justify-between gap-2">
              <span className="truncate text-white font-mono">{telemetry.phaseLabel}</span>
              {telemetry.isAirborne && (
                <span className="shrink-0 text-electricBlue flex items-center gap-1 font-bold">
                  <Sparkles className="w-2.5 h-2.5" /> AIRBORNE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM TIMELINE & INTERACTIVE SCRUBBER BAR */}
        <motion.div
          style={{ opacity: timelineOpacity, pointerEvents: timelinePointer }}
          className="absolute bottom-5 left-4 right-4 md:left-14 md:right-14 z-20 flex flex-col gap-2"
        >
          {/* Phase Markers */}
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
            {PHASES_TIMELINE.map((phase, idx) => {
              const isActive = idx === activePhaseIdx;
              return (
                <span
                  key={phase.id}
                  className={`transition-colors duration-300 ${
                    isActive
                      ? "text-electricBlue font-bold drop-shadow-[0_0_8px_rgba(86,200,255,0.8)]"
                      : "text-neutral-500"
                  }`}
                >
                  {phase.label}
                </span>
              );
            })}
          </div>

          {/* Interactive Scrub Track Slider */}
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.002}
              value={scrollYProgress.get()}
              onMouseDown={() => {
                isScrubbingRef.current = true;
                setIsPlaying(false);
              }}
              onTouchStart={() => {
                isScrubbingRef.current = true;
                setIsPlaying(false);
              }}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                scrollYProgress.set(val);
                smoothProgress.set(val);
              }}
              onMouseUp={() => {
                isScrubbingRef.current = false;
              }}
              onTouchEnd={() => {
                isScrubbingRef.current = false;
              }}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-neonRed focus:outline-none"
            />
          </div>

          {/* Interactive Flight Controls Toolbar */}
          <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
            {/* Speed Multipliers */}
            <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
              <span className="text-neutral-400 text-[10px] mr-1">SPEED:</span>
              {[0.5, 1.0, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    sound.playClick();
                    setPlaybackSpeed(spd);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    playbackSpeed === spd
                      ? "bg-white/20 text-white font-bold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Play / Pause / Replay Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  if (hasEnded) {
                    replayFlight();
                  } else {
                    setIsPlaying((p) => !p);
                  }
                }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all active:scale-95"
              >
                {hasEnded ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 text-electricBlue" />
                    <span>REPLAY FLIGHT</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>PLAY</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Seamless bottom handover gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#08090C] pointer-events-none z-10" />
      </div>
    </section>
  );
}
