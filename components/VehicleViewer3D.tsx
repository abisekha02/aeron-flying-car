"use client";

/**
 * VehicleViewer3D — AERON Project Stratos
 * Real GLB vehicle loaded via React Three Fiber + @react-three/drei
 * Features: 360° drag/zoom, Road/Flight mode, colour swatch, telemetry hotspots
 */

import React, {
  Suspense,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Info,
  Maximize2,
  Sparkles,
  Plane,
  Car,
} from "lucide-react";
import { sound } from "../utils/audio";

/* ─────────────────────────────────────────────
   Hotspot data
───────────────────────────────────────────── */
interface Hotspot {
  id: string;
  name: string;
  desc: string;
  category: "aero" | "propulsion" | "cockpit" | "structure";
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "canopy",
    name: "Electrochromic Smart Canopy",
    desc: "Single-piece curved aerospace polycarbonate with dynamic variable tint and heads-up telemetry projection.",
    category: "cockpit",
  },
  {
    id: "wing-left",
    name: "Morphing Aero Winglet (Port)",
    desc: "Variable-camber carbon composite wing capable of 35° sweep transition from high-downforce ground mode to flight lift.",
    category: "aero",
  },
  {
    id: "wing-right",
    name: "Morphing Aero Winglet (Starboard)",
    desc: "Active vortex-shedding winglet with integrated ion-plasma boundary layer control actuators.",
    category: "aero",
  },
  {
    id: "thruster-rear",
    name: "Dual Vector-Ion Thruster",
    desc: "Twin ceramic core magnetic induction thrusters delivering 12,000 N instantaneous directional thrust vectoring.",
    category: "propulsion",
  },
  {
    id: "nose-lidar",
    name: "Optical Fly-by-Wire LiDAR Array",
    desc: "360-degree pulsed nanosecond optical array providing corridor mapping up to 4.2 km at Mach 0.4.",
    category: "structure",
  },
];

/* ─────────────────────────────────────────────
   Color finish options (hex + display name)
───────────────────────────────────────────── */
const FINISH_OPTIONS = [
  { hex: "#DCE1E8", name: "Liquid Silver" },
  { hex: "#0D0E12", name: "Obsidian" },
  { hex: "#8B0000", name: "Crimson Reserve" },
  { hex: "#F5F7FA", name: "Pearl White" },
];

/* ─────────────────────────────────────────────
   Lazy-load heavy R3F canvas (SSR-safe, static-export safe)
───────────────────────────────────────────── */
const VehicleCanvas = dynamic(() => import("./VehicleCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-transparent">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-electricBlue/30 border-t-electricBlue animate-spin" />
        <div
          className="absolute inset-2 w-12 h-12 rounded-full border-2 border-crimson/20 border-b-crimson animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
        />
      </div>
      <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest animate-pulse">
        INITIALISING 3D ENVIRONMENT…
      </p>
    </div>
  ),
});

/* ─────────────────────────────────────────────
   Main exported section component
───────────────────────────────────────────── */
export default function VehicleViewer3D() {
  const [activeMode, setActiveMode] = useState<"road" | "flight">("flight");
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [colorHex, setColorHex] = useState(FINISH_OPTIONS[0].hex);
  const [zoomSignal, setZoomSignal] = useState(0); // positive = zoom in, negative = out
  const [resetSignal, setResetSignal] = useState(0);

  const handleModeSwitch = (mode: "road" | "flight") => {
    sound.playChime(mode === "flight" ? 820 : 540, "triangle", 0.2);
    setActiveMode(mode);
  };

  const handleZoom = (dir: "in" | "out") => {
    sound.playClick();
    setZoomSignal((p) => p + (dir === "in" ? 1 : -1));
  };

  const handleReset = () => {
    sound.playClick();
    setResetSignal((p) => p + 1);
  };

  return (
    <section
      id="vehicle-3d"
      className="relative py-24 md:py-32 bg-[#040507] text-silver overflow-hidden"
    >
      {/* Background ambience */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-electricBlue/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-crimson/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electricBlue/10 border border-electricBlue/20 text-electricBlue text-xs font-mono tracking-[0.25em] uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Real-Time 3D Laboratory</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
              360° CRAFT <br />
              <span className="bg-gradient-to-r from-white via-silver to-neutral-500 bg-clip-text text-transparent">
                INSPECTION.
              </span>
            </h2>
          </div>
          <p className="text-sm md:text-base text-silver/75 max-w-md font-light">
            Manipulate the spatial 3D model in real time. Switch between
            high-downforce ground aerodynamics and active flight geometry.
          </p>
        </div>

        {/* 3D Viewport */}
        <div className="relative w-full h-[580px] md:h-[700px] glass-panel rounded-3xl border border-white/15 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)]">
          {/* R3F Canvas (lazy, no SSR) */}
          <Suspense fallback={null}>
            <VehicleCanvas
              mode={activeMode}
              colorHex={colorHex}
              autoRotate={isAutoRotating}
              zoomSignal={zoomSignal}
              resetSignal={resetSignal}
            />
          </Suspense>

          {/* ── Top-left: Mode Switcher ── */}
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
            <div className="p-1 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 flex items-center gap-1 shadow-2xl">
              <button
                onClick={() => handleModeSwitch("road")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                  activeMode === "road"
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Road Mode</span>
              </button>
              <button
                onClick={() => handleModeSwitch("flight")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                  activeMode === "flight"
                    ? "bg-gradient-to-r from-crimson to-neonRed text-white font-bold shadow-[0_0_15px_rgba(255,38,56,0.5)]"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Flight Mode</span>
              </button>
            </div>

            {/* Status pill */}
            <div className="px-3.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 font-mono text-[10px] text-neutral-400 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeMode === "flight"
                    ? "bg-electricBlue animate-pulse"
                    : "bg-neutral-500"
                }`}
              />
              <span>
                GEOMETRY:{" "}
                {activeMode === "flight"
                  ? "WINGS DEPLOYED // LEVITATION ON"
                  : "GROUND SQUAT // WHEELS ENGAGED"}
              </span>
            </div>
          </div>

          {/* ── Top-right: Controls ── */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setIsAutoRotating((v) => !v);
              }}
              title={isAutoRotating ? "Pause Auto-Rotation" : "Enable Auto-Rotation"}
              className={`p-2.5 rounded-xl border backdrop-blur-xl transition-all ${
                isAutoRotating
                  ? "bg-electricBlue/20 border-electricBlue/40 text-electricBlue"
                  : "bg-black/60 border-white/10 text-neutral-400 hover:text-white"
              }`}
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom("in")}
              title="Zoom In"
              className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-neutral-300 hover:text-white backdrop-blur-xl transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom("out")}
              title="Zoom Out"
              className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-neutral-300 hover:text-white backdrop-blur-xl transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              title="Reset View"
              className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-neutral-300 hover:text-white backdrop-blur-xl transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* ── Bottom-left: Hotspot inspector ── */}
          <div className="absolute bottom-6 left-6 z-20 max-w-sm sm:max-w-md">
            <div className="p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-electricBlue flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Component Telemetry Hotspots</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  5 SENSORS ACTIVE
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {HOTSPOTS.map((spot) => {
                  const isActive = selectedHotspot?.id === spot.id;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedHotspot(isActive ? null : spot);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                        isActive
                          ? "bg-electricBlue text-black font-bold shadow-[0_0_12px_rgba(86,200,255,0.7)]"
                          : "bg-white/5 text-neutral-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {spot.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>

              {selectedHotspot && (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-electricBlue/30 text-xs space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <p className="font-bold text-white font-mono uppercase text-[11px]">
                    {selectedHotspot.name}
                  </p>
                  <p className="text-silver/80 text-[11px] leading-relaxed">
                    {selectedHotspot.desc}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom-right: Colour swatches ── */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
            <div className="p-2.5 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 flex items-center gap-2 shadow-2xl">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest px-2">
                FINISH:
              </span>
              {FINISH_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    sound.playClick();
                    setColorHex(c.hex);
                  }}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    colorHex === c.hex
                      ? "border-electricBlue scale-110 shadow-[0_0_10px_#56C8FF]"
                      : "border-white/20 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              CLICK &amp; DRAG TO ROTATE // SCROLL TO ZOOM
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
