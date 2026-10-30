"use client";

import React from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { ArrowDown, Compass, Wind, ShieldAlert, Cpu, Sparkles } from "lucide-react";

interface CarTextOverlaysProps {
  progress: MotionValue<number>;
}

interface StoryPhase {
  id: number;
  badge: string;
  headline: string;
  subtext: string;
  icon: React.ElementType;
  position: "bottom-left" | "bottom-right" | "top-left" | "bottom-center";
  range: [number, number, number, number]; // [fade-in-start, full-in, fade-out-start, full-out]
}

const PHASES: StoryPhase[] = [
  {
    id: 1,
    badge: "PHASE 01 // TARMAC ACCELERATION",
    headline: "THE SKY IS YOURS.",
    subtext:
      "A new dimension of motion. AERON unleashes instantaneous electric torque on the runway.",
    icon: Compass,
    position: "bottom-left",
    range: [0.0, 0.02, 0.11, 0.15],
  },
  {
    id: 2,
    badge: "PHASE 02 // CURVED ASCENT",
    headline: "DEFY THE ORDINARY.",
    subtext:
      "Climbing the illuminated red launch ramp. Dynamic downforce vectors press the carbon chassis into the curve.",
    icon: Wind,
    position: "bottom-right",
    range: [0.15, 0.19, 0.28, 0.32],
  },
  {
    id: 3,
    badge: "PHASE 03 // 0-G INVERSION",
    headline: "NO LIMITS. NO HORIZON.",
    subtext:
      "Traveling inverted along the apex arc. Gyroscopic telemetry stabilizes the panoramic cockpit at negative Gs.",
    icon: ShieldAlert,
    position: "bottom-left",
    range: [0.31, 0.35, 0.42, 0.46],
  },
  {
    id: 4,
    badge: "PHASE 04 // TAKEOFF TRANSITION",
    headline: "BEYOND THE ROAD.",
    subtext:
      "Launching off the ramp and flipping upright. Dual morphing wings lock into aerodynamic cruising geometry.",
    icon: Sparkles,
    position: "bottom-right",
    range: [0.45, 0.49, 0.57, 0.61],
  },
  {
    id: 5,
    badge: "PHASE 05 // CRUISE PROPULSION",
    headline: "ENGINEERED TO FLY.",
    subtext:
      "Twin dual-aperture ducted ion thrusters illuminate the night sky in cold electric blue, unlocking 380 km/h unrestricted flight corridors.",
    icon: Cpu,
    position: "bottom-left",
    // Extended prominence: stays clearly visible throughout the entire sustained flying car cruise
    range: [0.60, 0.65, 0.82, 0.87],
  },
  {
    id: 6,
    badge: "PHASE 06 // TERMINAL DESCENT",
    headline: "LAND IN THE FUTURE.",
    subtext:
      "Decelerating on automated approach. Airbrakes modulate drag for a velvet-soft touchdown back onto the runway.",
    icon: ArrowDown,
    position: "bottom-center",
    range: [0.87, 0.91, 0.98, 1.0],
  },
];

function PhaseCard({ phase, progress }: { phase: StoryPhase; progress: MotionValue<number> }) {
  const [startIn, fullIn, startOut, fullOut] = phase.range;

  // Opacity transform
  const opacity = useTransform(progress, [startIn, fullIn, startOut, fullOut], [0, 1, 1, 0]);

  // Subtle vertical float
  const y = useTransform(progress, [startIn, fullIn, startOut, fullOut], [24, 0, 0, -24]);

  const Icon = phase.icon;

  const positionClasses = {
    "bottom-left": "bottom-10 md:bottom-20 left-4 md:left-14 max-w-sm md:max-w-lg text-left items-start",
    "bottom-right": "bottom-10 md:bottom-20 right-4 md:right-14 max-w-sm md:max-w-lg text-left md:text-right items-start md:items-end ml-auto",
    "top-left": "top-24 left-4 md:left-14 max-w-sm md:max-w-lg text-left items-start",
    "bottom-center": "bottom-10 md:bottom-20 left-1/2 -translate-x-1/2 max-w-md md:max-w-xl text-center items-center",
  }[phase.position];

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute pointer-events-none z-20 flex flex-col ${positionClasses} px-3 py-2`}
    >
      <div className="glass-panel p-5 md:p-8 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl relative overflow-hidden group">
        {/* Glowing accent border top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neonRed to-transparent opacity-80" />

        {/* Phase Badge */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="p-1.5 rounded-lg bg-neonRed/10 text-neonRed border border-neonRed/20">
            <Icon className="w-3.5 h-3.5" />
          </span>
          <span className="text-[10px] md:text-xs font-mono tracking-[0.25em] text-neonRed uppercase font-semibold">
            {phase.badge}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-2.5">
          {phase.headline}
        </h2>

        {/* Subtext */}
        <p className="text-xs sm:text-sm md:text-base text-silver/85 font-light leading-relaxed max-w-md">
          {phase.subtext}
        </p>

        {/* Corner technical tick */}
        <div className="absolute bottom-2 right-2 text-[9px] font-mono text-white/20 select-none">
          SYS // 0{phase.id}
        </div>
      </div>
    </motion.div>
  );
}

export default function CarTextOverlays({ progress }: CarTextOverlaysProps) {
  return (
    <div className="absolute inset-0 pointer-events-none w-full h-full">
      {PHASES.map((phase) => (
        <PhaseCard key={phase.id} phase={phase} progress={progress} />
      ))}
    </div>
  );
}
