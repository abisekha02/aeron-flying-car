"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TECHNOLOGY_PILLARS, TechnologyPillar } from "../data/vehicle";
import { Wind, Cpu, ShieldCheck, Eye, ArrowRight, Gauge, Layers, Sparkles } from "lucide-react";

const PILLAR_ICONS: Record<string, React.ElementType> = {
  aero: Wind,
  propulsion: Sparkles,
  "flight-control": Cpu,
  cabin: Eye,
};

export default function FlightTechnology() {
  const [activePillarId, setActivePillarId] = useState<string>(TECHNOLOGY_PILLARS[0].id);

  const activePillar =
    TECHNOLOGY_PILLARS.find((p) => p.id === activePillarId) || TECHNOLOGY_PILLARS[0];

  return (
    <section id="engineering" className="relative py-28 md:py-36 bg-[#08090C] text-silver overflow-hidden">
      {/* Background cyber grid & glow accents */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-crimson/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-electricBlue/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neonRed/10 border border-neonRed/20 text-neonRed text-xs font-mono tracking-[0.25em] uppercase mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Advanced Flight Architecture</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
            ENGINEERED FOR <br />
            <span className="bg-gradient-to-r from-white via-silver to-neutral-400 bg-clip-text text-transparent">
              DUAL REALMS.
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-silver/80 font-light leading-relaxed">
            Where hypercar aerodynamics collide with aerospace vector propulsion. AERON transitions seamlessly between asphalt grip and stratospheric velocity in under 3.2 seconds.
          </p>
        </div>

        {/* Interactive Pillar Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {TECHNOLOGY_PILLARS.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.id] || Wind;
            const isActive = pillar.id === activePillarId;

            return (
              <button
                key={pillar.id}
                onClick={() => setActivePillarId(pillar.id)}
                className={`group text-left p-5 rounded-2xl transition-all duration-300 relative border ${
                  isActive
                    ? "bg-[#111317] border-neonRed/60 shadow-[0_10px_30px_rgba(255,38,56,0.15)]"
                    : "bg-[#0D0E12]/80 border-white/5 hover:border-white/20 hover:bg-[#111317]/50"
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neonRed to-crimson rounded-t-2xl" />
                )}

                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`p-2 rounded-xl transition-colors ${
                      isActive ? "bg-neonRed text-white" : "bg-white/5 text-neutral-400 group-hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    0{TECHNOLOGY_PILLARS.indexOf(pillar) + 1}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 line-clamp-1">
                  {pillar.title}
                </h3>
                <p className="text-[11px] text-neutral-400 font-light truncate">
                  {pillar.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detailed Pillar Showcase Card */}
        <div className="glass-panel p-8 md:p-14 rounded-3xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePillar.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
            >
              {/* Left Column: Editorial & Features */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-electricBlue shadow-[0_0_10px_#56C8FF]" />
                  <span className="text-xs font-mono text-electricBlue uppercase tracking-[0.2em] font-semibold">
                    {activePillar.subtitle}
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                  {activePillar.title}
                </h3>

                <p className="text-base sm:text-lg text-silver/80 font-light leading-relaxed">
                  {activePillar.description}
                </p>

                {/* Key Metrics Banner */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/10">
                  {activePillar.metrics.map((m, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">{m.label}</p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Technical Bullet points */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                    Architectural Specifications:
                  </p>
                  <ul className="space-y-2.5">
                    {activePillar.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-silver/90">
                        <span className="w-1.5 h-1.5 rounded-full bg-neonRed mt-2 shrink-0 shadow-[0_0_6px_#FF2638]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: High-tech Visual Schematic Graphic */}
              <div className="lg:col-span-5 relative flex items-center justify-center p-8 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 overflow-hidden min-h-[360px]">
                {/* Glowing radial backdrop */}
                <div className="absolute inset-0 bg-radial-glow from-neonRed/10 via-electricBlue/5 to-transparent pointer-events-none" />

                {/* Contextual Technical SVG Graphic */}
                {activePillar.id === "aero" && (
                  <div className="w-full flex flex-col items-center justify-center space-y-6">
                    <svg viewBox="0 0 300 180" className="w-full max-w-[280px] drop-shadow-[0_0_20px_rgba(86,200,255,0.4)]">
                      {/* Morphing Aerodynamic Airfoil */}
                      <path
                        d="M 20 100 Q 110 30 260 95 Q 160 125 20 100"
                        fill="none"
                        stroke="#DCE1E8"
                        strokeWidth="3"
                      />
                      {/* Trailing edge actuator */}
                      <path d="M 260 95 L 290 85" stroke="#FF2638" strokeWidth="3" strokeDasharray="4 2" />
                      {/* Flow stream lines */}
                      <path d="M 10 50 Q 120 15 290 65" stroke="#56C8FF" strokeWidth="1.5" strokeOpacity="0.7" />
                      <path d="M 10 75 Q 120 40 290 80" stroke="#56C8FF" strokeWidth="1.5" strokeOpacity="0.9" />
                      <path d="M 10 135 Q 140 135 290 120" stroke="#56C8FF" strokeWidth="1.5" strokeOpacity="0.5" />
                    </svg>
                    <div className="text-center">
                      <p className="text-xs font-mono uppercase tracking-[0.2em] text-white font-semibold">Active Morphing Profile</p>
                      <p className="text-[11px] text-neutral-400">Zero parasitic drag in transition</p>
                    </div>
                  </div>
                )}

                {activePillar.id === "propulsion" && (
                  <div className="w-full flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      {/* Concentric vectoring rings */}
                      <div className="absolute inset-0 rounded-full border border-electricBlue/30 animate-spin" style={{ animationDuration: "12s" }} />
                      <div className="absolute inset-3 rounded-full border border-white/20 border-dashed animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
                      <div className="absolute inset-8 rounded-full bg-electricBlue/10 border border-electricBlue shadow-[0_0_30px_rgba(86,200,255,0.6)] flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neonRed to-electricBlue animate-pulse flex items-center justify-center text-white text-xs font-mono font-bold">
                          ION-X
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-mono uppercase tracking-[0.2em] text-white font-semibold">Omni-Vector Ducted Fan</p>
                      <p className="text-[11px] text-neutral-400">3-Axis Instantaneous Torque</p>
                    </div>
                  </div>
                )}

                {activePillar.id === "flight-control" && (
                  <div className="w-full flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-48 h-36 border border-white/20 rounded-xl p-4 bg-black/40 font-mono text-[10px] space-y-2">
                      <div className="flex justify-between text-neonRed border-b border-white/10 pb-1">
                        <span>LIDAR 360 // PULSED</span>
                        <span className="animate-pulse">ACTIVE</span>
                      </div>
                      <div className="text-neutral-400 space-y-1">
                        <p>&gt; YAW STABILITY: 99.98%</p>
                        <p>&gt; PITCH TRIM: AUTO-LOCK</p>
                        <p>&gt; SKYWAY TRAFFIC: NOMINAL</p>
                        <p className="text-electricBlue">&gt; TCAS-X: 0 CONFLICTS</p>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-4/5 h-full bg-neonRed" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-mono uppercase tracking-[0.2em] text-white font-semibold">Tri-Core Optical Fly-by-Wire</p>
                      <p className="text-[11px] text-neutral-400">Pulsed LiDAR predictive corridor radar</p>
                    </div>
                  </div>
                )}

                {activePillar.id === "cabin" && (
                  <div className="w-full flex flex-col items-center justify-center space-y-6">
                    <svg viewBox="0 0 240 140" className="w-full max-w-[240px]">
                      {/* Electrochromic canopy arc */}
                      <path
                        d="M 30 110 C 50 30, 190 30, 210 110"
                        fill="rgba(86, 200, 255, 0.1)"
                        stroke="#56C8FF"
                        strokeWidth="2.5"
                      />
                      <line x1="30" y1="110" x2="210" y2="110" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
                      <circle cx="95" cy="85" r="14" fill="#DCE1E8" fillOpacity="0.8" />
                      <circle cx="145" cy="85" r="14" fill="#DCE1E8" fillOpacity="0.8" />
                    </svg>
                    <div className="text-center">
                      <p className="text-xs font-mono uppercase tracking-[0.2em] text-white font-semibold">Pressurized Electrochromic Sanctuary</p>
                      <p className="text-[11px] text-neutral-400">270° Panoramic Field of View</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Transition Showcase Banner */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-crimson/20 via-black to-electricBlue/15 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-lg font-bold uppercase tracking-wider text-white">
              Ground-to-Air Instantaneous Transition
            </h4>
            <p className="text-sm text-silver/70 font-light max-w-xl">
              From high-downforce tarmac grip to vertical aerofoil lift in a single continuous kinetic motion without mechanical stoppage.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0 font-mono text-xs">
            <div className="text-center">
              <span className="block text-2xl font-black text-white">3.2s</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Morph Time</span>
            </div>
            <div className="h-8 w-[1px] bg-white/20" />
            <div className="text-center">
              <span className="block text-2xl font-black text-electricBlue">100%</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Fly-by-Wire</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
