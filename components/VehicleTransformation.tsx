"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Car, 
  Plane, 
  ArrowRight, 
  RotateCw, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Cpu, 
  Wind,
  ShieldAlert
} from "lucide-react";
import { sound } from "../utils/audio";

interface Step {
  id: number;
  phase: string;
  duration: string;
  title: string;
  description: string;
  state: {
    wheels: string;
    wings: string;
    thrusters: string;
    aerodynamics: string;
  };
  visualFrame: string;
}

const TRANSFORMATION_STEPS: Step[] = [
  {
    id: 1,
    phase: "PHASE 01 // GROUND PROFILE",
    duration: "0.0s",
    title: "High-Downforce Asphalt Architecture",
    description: "Four active carbon-ceramic wheels transmit instantaneous torque to the track. Aerodynamic ground-effect skirts generate 450 kg downforce.",
    state: {
      wheels: "Active AWD Ground Contact (100% Torque)",
      wings: "Stowed within side fuselage pods",
      thrusters: "Standby idle (5% baseline)",
      aerodynamics: "High downforce / low frontal area",
    },
    visualFrame: "/images/aeron/1.webp",
  },
  {
    id: 2,
    phase: "PHASE 02 // LAUNCH ENVELOPE",
    duration: "1.2s",
    title: "Curved Ramp Compression & Energy Build",
    description: "Ascending the illuminated launch ramp. Regenerative magnetic inductors charge flight supercapacitors to 100% burst reserve.",
    state: {
      wheels: "High-G ramp compression load",
      wings: "Pre-extension unlocking sequence initiated",
      thrusters: "Twin ducted fans spooling to 85,000 RPM",
      aerodynamics: "Transition boundary vortex control",
    },
    visualFrame: "/images/aeron/8.webp",
  },
  {
    id: 3,
    phase: "PHASE 03 // WING DEPLOYMENT & FLIP",
    duration: "2.1s",
    title: "Acrobatic Inversion & Aero Morphing",
    description: "Vehicle clears ramp apex. Titanium-mesh carbon composite winglets articulate outwards 35°. Wheels retract flush into body cavities.",
    state: {
      wheels: "Hydraulically retracted flush into aerodynamic wells",
      wings: "35° swept delta wings locked into camber position",
      thrusters: "Full 12,000 N ion-plasma vector ignition",
      aerodynamics: "Zero parasitic drag profile",
    },
    visualFrame: "/images/aeron/21.webp",
  },
  {
    id: 4,
    phase: "PHASE 04 // STRATOSPHERIC FLIGHT",
    duration: "3.2s",
    title: "Sustained Airborne Vector Cruise",
    description: "Fully airborne at 380 km/h cruising velocity. Triple-redundant fly-by-wire computer modulates altitude and skyway corridor alignment.",
    state: {
      wheels: "Fully enclosed within aerodynamically sealed floor",
      wings: "Active adaptive trailing-edge micro-flaps",
      thrusters: "Continuous dual-aperture cold-blue ion burn",
      aerodynamics: "High lift-to-drag supersonic glider geometry",
    },
    visualFrame: "/images/aeron/28.webp",
  },
];

export default function VehicleTransformation() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentStep = TRANSFORMATION_STEPS[currentStepIndex];

  const handleStepSelect = (index: number) => {
    sound.playChime(600 + index * 80, "triangle", 0.2);
    setCurrentStepIndex(index);
  };

  const handleNext = () => {
    sound.playClick();
    setCurrentStepIndex((prev) => (prev + 1) % TRANSFORMATION_STEPS.length);
  };

  return (
    <section id="transformation" className="relative py-24 md:py-32 bg-[#050608] text-silver overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-[600px] h-[500px] bg-gradient-to-l from-crimson/15 via-neonRed/5 to-transparent blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neonRed/10 border border-neonRed/20 text-neonRed text-xs font-mono tracking-[0.25em] uppercase mb-4">
              <Layers className="w-3.5 h-3.5" />
              <span>Continuous Morphing Kinetics</span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
              GROUND TO AIR <br />
              <span className="bg-gradient-to-r from-white via-silver to-neutral-500 bg-clip-text text-transparent">
                TRANSFORMATION.
              </span>
            </h2>
          </div>

          <p className="text-sm md:text-base text-silver/75 max-w-md font-light">
            Examine the mechanical sequence converting supercar asphalt traction into vertical aerofoil flight in exactly 3.2 seconds without physical stoppage.
          </p>
        </div>

        {/* Step Progression Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {TRANSFORMATION_STEPS.map((step, idx) => {
            const isSelected = idx === currentStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => handleStepSelect(idx)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 relative ${
                  isSelected
                    ? "bg-[#101217] border-neonRed shadow-[0_10px_30px_rgba(255,38,56,0.2)]"
                    : "bg-[#090b0e] border-white/10 hover:border-white/20 text-neutral-400 hover:text-white"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neonRed to-electricBlue" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    STEP 0{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-electricBlue font-bold">
                    {step.duration}
                  </span>
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white line-clamp-1">
                  {step.title.split(" ")[0]} {step.title.split(" ")[1] || ""}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Interactive Showcase Card */}
        <div className="glass-panel p-6 sm:p-10 md:p-12 rounded-3xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.9)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Frame */}
          <div className="lg:col-span-7 relative w-full overflow-hidden rounded-2xl bg-black/60 border border-white/10" style={{ aspectRatio: "16/9" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={currentStep.visualFrame}
                  alt={currentStep.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 font-mono text-[10px] text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neonRed animate-pulse" />
              <span>{currentStep.phase}</span>
            </div>

            <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 font-mono text-[10px] text-electricBlue font-bold">
              SEQUENCE CLOCK: T+{currentStep.duration}
            </div>
          </div>

          {/* Right Column: Step Breakdown & Mechanics */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-electricBlue font-semibold block mb-2">
                Transformation Stage 0{currentStep.id} of 04
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                {currentStep.title}
              </h3>
              <p className="mt-3 text-sm text-silver/80 font-light leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Component State Matrix */}
            <div className="space-y-3 pt-2 border-t border-white/10 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-neutral-400 text-[11px] uppercase">WHEEL ACTUATION:</span>
                <span className="text-white font-bold text-[11px] text-right">{currentStep.state.wheels}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-neutral-400 text-[11px] uppercase">WING SURFACES:</span>
                <span className="text-electricBlue font-bold text-[11px] text-right">{currentStep.state.wings}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-neutral-400 text-[11px] uppercase">ION PROPULSION:</span>
                <span className="text-neonRed font-bold text-[11px] text-right">{currentStep.state.thrusters}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-neutral-400 text-[11px] uppercase">AERO BALANCE:</span>
                <span className="text-silver font-bold text-[11px] text-right">{currentStep.state.aerodynamics}</span>
              </div>
            </div>

            {/* Next Stage Button */}
            <div className="pt-2">
              <button
                onClick={handleNext}
                className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Advance to Next Stage</span>
                <ArrowRight className="w-4 h-4 text-electricBlue" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
