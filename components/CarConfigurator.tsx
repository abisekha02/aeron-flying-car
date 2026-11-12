"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLOR_OPTIONS,
  INTERIOR_OPTIONS,
  AERO_PACKAGES,
  ColorOption,
  InteriorOption,
  AeroPackage,
} from "../data/vehicle";
import { Check, RotateCcw, Palette, Layers, Sparkles, Bookmark, Share2 } from "lucide-react";

/**
 * Maps color id → authentic full-fidelity vehicle renders provided for each paint finish.
 */
const COLOR_IMAGES: Record<string, string> = {
  silver: "/images/configurator/silver.png",
  obsidian: "/images/configurator/obsidian.png",
  crimson: "/images/configurator/crimson.png",
  white: "/images/configurator/white.png",
};

export default function CarConfigurator() {
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLOR_OPTIONS[0]);
  const [selectedInterior, setSelectedInterior] = useState<InteriorOption>(INTERIOR_OPTIONS[0]);
  const [selectedAero, setSelectedAero] = useState<AeroPackage>(AERO_PACKAGES[0]);
  const [lightingMode, setLightingMode] = useState<"red" | "blue">("blue");
  const [savedNotification, setSavedNotification] = useState(false);

  // Preload all real car color renders for zero-latency instant transitions
  useEffect(() => {
    Object.values(COLOR_IMAGES).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

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

            {/* Real Car Image Visualizer — dynamically swapped based on selected color */}
            <div className="my-6 flex flex-col items-center justify-center relative">
              <div
                className="relative w-full overflow-hidden rounded-2xl bg-black/60 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/5"
                style={{ aspectRatio: "16/9" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedColor.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={COLOR_IMAGES[selectedColor.id] ?? "/images/configurator/silver.png"}
                      alt={`AERON flying car in ${selectedColor.name} finish — ${selectedColor.finish}`}
                      fill
                      priority
                      unoptimized
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 56vw"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Lighting-mode accent reflections onto the landing stage */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-700 rounded-2xl"
                  style={{
                    background:
                      lightingMode === "blue"
                        ? "radial-gradient(circle at 50% 90%, rgba(86,200,255,0.15) 0%, transparent 60%)"
                        : "radial-gradient(circle at 50% 90%, rgba(255,38,56,0.18) 0%, transparent 60%)",
                  }}
                />

                {/* Aero pack dynamic badge */}
                {selectedAero.id === "apex-track" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-neonRed/90 backdrop-blur-md text-[10px] font-mono text-white uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,38,56,0.5)]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>APEX TRACK PACKAGE // ACTIVE</span>
                  </motion.div>
                )}

                {/* Bottom glassmorphic status overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none flex items-end justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      {selectedColor.name}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-silver/80 uppercase tracking-widest bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10">
                    {selectedColor.finish}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 border-t border-white/10 pt-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-electricBlue animate-pulse" />
                REAL-TIME VEHICLE SPECIFICATION
              </span>
              <span className="text-electricBlue">
                {selectedColor.name.toUpperCase()} // {lightingMode.toUpperCase()} THRUSTERS
              </span>
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
