"use client";

import React, { useState } from "react";
import { VEHICLE_SPECIFICATIONS, AERON_CONCEPT_METADATA } from "../data/vehicle";
import { Sliders, Info, ShieldCheck, Activity, Zap } from "lucide-react";

export default function SpecsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...VEHICLE_SPECIFICATIONS.map((s) => s.category)];

  const filteredSpecs =
    selectedCategory === "all"
      ? VEHICLE_SPECIFICATIONS
      : VEHICLE_SPECIFICATIONS.filter((s) => s.category === selectedCategory);

  return (
    <section id="specifications" className="relative py-28 md:py-36 bg-[#050505] text-silver overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial-glow from-crimson/10 via-electricBlue/5 to-transparent blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electricBlue/10 border border-electricBlue/20 text-electricBlue text-xs font-mono tracking-[0.25em] uppercase mb-4">
              <Sliders className="w-3.5 h-3.5" />
              <span>Engineering Benchmark Envelope</span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
              CONCEPT <br />
              <span className="bg-gradient-to-r from-white via-silver to-neutral-500 bg-clip-text text-transparent">
                SPECIFICATIONS.
              </span>
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {cat === "all" ? "All Systems" : cat.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Specifications Cards Grid */}
        <div className="space-y-12">
          {filteredSpecs.map((group) => (
            <div key={group.category} className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold uppercase tracking-wider text-white">
                  {group.category}
                </h3>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    className="glass-panel p-6 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all duration-300 group relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Illustrative Flag */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
                          {item.label}
                        </span>
                        {item.isIllustrative && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/10 group-hover:border-neonRed/30 group-hover:text-neonRed transition-colors">
                            CONCEPT DESIGN TARGET
                          </span>
                        )}
                      </div>

                      {/* Main Metric Value */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight group-hover:text-glow-silver transition-all">
                          {item.value}
                        </span>
                        {item.unit && (
                          <span className="text-xs font-mono text-electricBlue uppercase tracking-wider">
                            {item.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-silver/70 font-light leading-relaxed border-t border-white/5 pt-3">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Concept Transparency Disclaimer Box */}
        <div className="mt-16 p-6 rounded-2xl bg-[#0B0C0E] border border-white/10 flex items-start gap-4">
          <Info className="w-5 h-5 text-neonRed shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-white uppercase tracking-wider">
              Concept Specification Disclaimer
            </span>
            <p className="text-neutral-400 font-light leading-relaxed">
              {AERON_CONCEPT_METADATA.disclaimer} All figures reflect aerodynamic simulations and projected solid-state electrical power densities under Project Stratos phase 1 guidelines.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
