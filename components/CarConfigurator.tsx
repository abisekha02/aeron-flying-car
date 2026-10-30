"use client";

import React, { useState } from "react";
import {
  COLOR_OPTIONS,
  INTERIOR_OPTIONS,
  AERO_PACKAGES,
  ColorOption,
  InteriorOption,
  AeroPackage,
} from "../data/vehicle";
import { Check, RotateCcw, Palette, Layers, Sparkles, Bookmark, Share2 } from "lucide-react";

export default function CarConfigurator() {
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLOR_OPTIONS[0]);
  const [selectedInterior, setSelectedInterior] = useState<InteriorOption>(INTERIOR_OPTIONS[0]);
  const [selectedAero, setSelectedAero] = useState<AeroPackage>(AERO_PACKAGES[0]);
  const [lightingMode, setLightingMode] = useState<"red" | "blue">("blue");
  const [savedNotification, setSavedNotification] = useState(false);

  const resetConfig = () => {
    setSelectedColor(COLOR_OPTIONS[0]);
    setSelectedInterior(INTERIOR_OPTIONS[0]);
    setSelectedAero(AERO_PACKAGES[0]);
    setLightingMode("blue");
  };

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <section id="configurator" className="relative py-28 md:py-36 bg-[#08090C] text-silver overflow-hidden">
      {/* Dynamic ambient glow reflecting selected color */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[180px] pointer-events-none transition-all duration-700 opacity-20"
        style={{ backgroundColor: selectedColor.ambientLight }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neonRed/10 border border-neonRed/20 text-neonRed text-xs font-mono tracking-[0.25em] uppercase mb-4">
              <Palette className="w-3.5 h-3.5" />
              <span>Interactive Concept Studio</span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
              TAILOR YOUR <br />
              <span className="bg-gradient-to-r from-white via-silver to-neutral-500 bg-clip-text text-transparent">
                FLIGHT CRAFT.
              </span>
            </h2>
          </div>

          <button
            onClick={resetConfig}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-all self-start md:self-end"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Specification</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Interactive Dynamic Vehicle SVG Visualization */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 flex flex-col justify-between min-h-[460px] relative overflow-hidden">
            {/* Top Bar with Live Active Specs */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedColor.hex }} />
                <span className="text-white font-bold uppercase">{selectedColor.name}</span>
                <span className="text-neutral-500">//</span>
                <span className="text-neutral-400">{selectedColor.finish}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightingMode("blue")}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-mono transition-all ${
                    lightingMode === "blue"
                      ? "bg-electricBlue/20 text-electricBlue border border-electricBlue/40"
                      : "text-neutral-500 hover:text-white"
                  }`}
                >
                  Ion Blue
                </button>
                <button
                  onClick={() => setLightingMode("red")}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-mono transition-all ${
                    lightingMode === "red"
                      ? "bg-neonRed/20 text-neonRed border border-neonRed/40"
                      : "text-neutral-500 hover:text-white"
                  }`}
                >
                  Apex Red
                </button>
              </div>
            </div>

            {/* Dynamic Vector Chassis Profile Visualizer */}
            <div className="my-10 flex items-center justify-center relative">
              <svg
                viewBox="0 0 600 240"
                className="w-full max-w-[540px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all duration-500"
              >
                <defs>
                  {/* Dynamic body gradient based on selected color */}
                  <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor={selectedColor.secondaryHex} />
                    <stop offset="40%" stopColor={selectedColor.hex} />
                    <stop offset="85%" stopColor={selectedColor.secondaryHex} />
                  </linearGradient>

                  {/* Thruster lighting gradient */}
                  <radialGradient id="thrusterPlume" cx="50%" cy="50%" r="50%">
                    <stop
                      offset="0%"
                      stopColor={lightingMode === "blue" ? "#FFFFFF" : "#FFFFFF"}
                    />
                    <stop
                      offset="40%"
                      stopColor={lightingMode === "blue" ? "#56C8FF" : "#FF2638"}
                      stopOpacity="0.8"
                    />
                    <stop
                      offset="100%"
                      stopColor={lightingMode === "blue" ? "#0055FF" : "#8B0000"}
                      stopOpacity="0"
                    />
                  </radialGradient>
                </defs>

                {/* Ground reflection shadow */}
                <ellipse cx="300" cy="210" rx="240" ry="14" fill="#020202" fillOpacity="0.8" />

                {/* Rear Thruster Plumes */}
                <ellipse cx="70" cy="145" rx="35" ry="12" fill="url(#thrusterPlume)" />
                <ellipse cx="70" cy="165" rx="35" ry="12" fill="url(#thrusterPlume)" />

                {/* Aero Winglet (changes with aero package) */}
                {selectedAero.id === "apex-track" ? (
                  <path
                    d="M 50 120 L 120 100 L 140 105 L 70 135 Z"
                    fill="#15171C"
                    stroke="#FF2638"
                    strokeWidth="1.5"
                  />
                ) : (
                  <path
                    d="M 65 128 L 115 115 L 125 118 L 80 135 Z"
                    fill="#15171C"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                  />
                )}

                {/* Main Flying Car Body Shell */}
                <path
                  d="M 80 155 
                     Q 110 135 180 125 
                     Q 260 85 360 85 
                     Q 450 90 520 145 
                     Q 540 160 510 170 
                     Q 440 178 300 175 
                     Q 150 175 80 165 Z"
                  fill="url(#bodyGradient)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.5"
                  className="transition-all duration-700"
                />

                {/* Seamless Black Glass Canopy */}
                <path
                  d="M 230 120 
                     Q 290 88 375 88 
                     Q 435 90 470 135 
                     Q 360 125 230 120 Z"
                  fill="#08090C"
                  fillOpacity="0.92"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                />

                {/* Interior Seat Silhouette highlight */}
                <circle cx="320" cy="112" r="9" fill={selectedInterior.id === "crimson-apex" ? "#FF2638" : selectedInterior.id === "cyber-blue" ? "#56C8FF" : "#8E97A4"} fillOpacity="0.6" />
                <circle cx="370" cy="112" r="9" fill={selectedInterior.id === "crimson-apex" ? "#FF2638" : selectedInterior.id === "cyber-blue" ? "#56C8FF" : "#8E97A4"} fillOpacity="0.6" />

                {/* Front LED Blade Lightbar */}
                <path
                  d="M 480 148 L 525 158"
                  stroke={lightingMode === "blue" ? "#56C8FF" : "#FF2638"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="transition-colors duration-300"
                />

                {/* Lower Skirt Aero Diffuser */}
                <path
                  d="M 120 170 L 480 170 L 470 176 L 130 176 Z"
                  fill="#0D0E12"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              </svg>
            </div>

            {/* Note clarifying dynamic vector rendering */}
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 border-t border-white/10 pt-4">
              <span>REAL-TIME DYNAMIC VECTOR SCHEMATIC</span>
              <span className="text-electricBlue">ACTIVE COLOR PALETTE: {selectedColor.name}</span>
            </div>
          </div>

          {/* Configurator Controls Sidebar */}
          <div className="lg:col-span-5 space-y-8">
            {/* 1. Exterior Color Selection */}
            <div className="space-y-3">
              <label className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 flex items-center justify-between">
                <span>1. Exterior Finish</span>
                <span className="text-white font-bold">{selectedColor.name}</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                {COLOR_OPTIONS.map((c) => {
                  const isSelected = c.id === selectedColor.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedColor(c)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 ${
                        isSelected
                          ? "bg-[#111317] border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                          : "bg-[#0D0E12] border-white/10 text-neutral-400 hover:border-white/30"
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full shrink-0 border border-white/30 flex items-center justify-center shadow-md"
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && (
                          <Check className={`w-3.5 h-3.5 ${c.id === "white" ? "text-black" : "text-white"}`} />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-white">{c.name}</p>
                        <p className="text-[10px] text-neutral-500 truncate">{c.finish}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Interior Sanctuary Selection */}
            <div className="space-y-3">
              <label className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 flex items-center justify-between">
                <span>2. Cabin Environment</span>
                <span className="text-white font-bold">{selectedInterior.name}</span>
              </label>

              <div className="space-y-2">
                {INTERIOR_OPTIONS.map((item) => {
                  const isSelected = item.id === selectedInterior.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedInterior(item)}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-300 ${
                        isSelected
                          ? "bg-[#111317] border-neonRed text-white"
                          : "bg-[#0D0E12] border-white/10 text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                          {item.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-neonRed" />}
                      </div>
                      <p className="text-[11px] text-neutral-400 font-light">{item.materials}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Aerodynamics Package */}
            <div className="space-y-3">
              <label className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 flex items-center justify-between">
                <span>3. Aerodynamic Profile</span>
                <span className="text-white font-bold">{selectedAero.name}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AERO_PACKAGES.map((pkg) => {
                  const isSelected = pkg.id === selectedAero.id;
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedAero(pkg)}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                        isSelected
                          ? "bg-[#111317] border-electricBlue text-white"
                          : "bg-[#0D0E12] border-white/10 text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase text-white">{pkg.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-electricBlue" />}
                      </div>
                      <p className="text-[10px] font-mono text-electricBlue mb-1">{pkg.downforceFactor}</p>
                      <p className="text-[11px] text-neutral-400 font-light line-clamp-2">{pkg.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save / Bookmark Concept Action */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-white font-semibold text-xs uppercase tracking-[0.2em] transition-all duration-300 active:scale-98"
              >
                <Bookmark className="w-4 h-4 text-neonRed" />
                <span>Save Concept Profile (Local)</span>
              </button>

              {savedNotification && (
                <div className="mt-3 p-3 rounded-lg bg-neonRed/10 border border-neonRed/30 text-neonRed text-xs font-mono text-center">
                  Configuration saved to local profile.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
