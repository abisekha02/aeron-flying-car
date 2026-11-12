"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TECHNOLOGY_PILLARS, TechnologyPillar } from "../data/vehicle";
import { Wind, Cpu, ShieldCheck, Eye, ArrowRight, Gauge, Layers, Sparkles } from "lucide-react";

/** Map pillar id → real image stored in public/images/engineering/ */
const PILLAR_IMAGES: Record<string, { src: string; alt: string; caption: string; sub: string }> = {
  aero: {
    src: "/images/engineering/aero-profile.webp",
    alt: "AERON flying car climbing the red launch ramp, showcasing active aerodynamic morphing surfaces",
    caption: "Active Morphing Profile",
    sub: "Zero parasitic drag in transition",
  },
  propulsion: {
    src: "/images/engineering/propulsion-fan.webp",
    alt: "AERON airborne in cruise with ion-blue thruster plumes illuminated — omni-vector ducted fan array",
    caption: "Omni-Vector Ducted Fan",
    sub: "3-Axis Instantaneous Torque",
  },
  "flight-control": {
    src: "/images/engineering/flight-control.webp",
    alt: "AERON cruising at altitude, flight control envelope engaged — tri-core optical fly-by-wire active",
    caption: "Tri-Core Optical Fly-by-Wire",
    sub: "Pulsed LiDAR predictive corridor radar",
  },
  cabin: {
    src: "/images/engineering/cabin-canopy.webp",
    alt: "AERON on approach to landing — pressurized electrochromic panoramic canopy sanctuary",
    caption: "Pressurized Electrochromic Sanctuary",
    sub: "270° Panoramic Field of View",
  },
};

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
    <section id="engineering" className="relative pt-20 pb-28 md:pt-24 md:pb-36 bg-[#08090C] text-silver overflow-hidden">
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

              {/* Right Column: Real car image for this pillar */}
              <div className="lg:col-span-5 relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 overflow-hidden min-h-[360px]">
                {/* Glowing radial backdrop */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,38,56,0.08) 0%, rgba(86,200,255,0.05) 50%, transparent 70%)" }} />

                {(() => {
                  const imgData = PILLAR_IMAGES[activePillar.id];
                  return imgData ? (
                    <div className="w-full flex flex-col items-center justify-center space-y-4 p-4">
                      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16/9" }}>
                        <Image
                          src={imgData.src}
                          alt={imgData.alt}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-700 hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          onError={(e) => {
                            // Graceful fallback: hide image, show pill
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        {/* Subtle cinematic overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none rounded-xl" />
                        {/* Phase badge */}
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono text-electricBlue uppercase tracking-widest">
                          AERON // {imgData.caption}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-mono uppercase tracking-[0.2em] text-white font-semibold">{imgData.caption}</p>
                        <p className="text-[11px] text-neutral-400">{imgData.sub}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-neutral-500 text-xs font-mono p-8 text-center">
                      Visual unavailable
                    </div>
                  );
                })()}
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
