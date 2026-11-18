"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cpu, 
  BatteryCharging, 
  Wind, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Radio, 
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";
import { sound } from "../utils/audio";

interface LabModule {
  id: string;
  name: string;
  icon: React.ElementType;
  tagline: string;
  coreTech: string;
  specs: { label: string; value: string }[];
  diagramPoints: string[];
  principles: string;
}

const LAB_MODULES: LabModule[] = [
  {
    id: "architecture",
    name: "Carbon-Titanium Monocoque",
    icon: Layers,
    tagline: "Aerospace Structural Integrity",
    coreTech: "Seamless woven pre-preg carbon fiber with 3D printed titanium bulkheads.",
    specs: [
      { label: "Torsional Rigidity", value: "68,000 Nm/deg" },
      { label: "Dry Chassis Weight", value: "1,180 kg" },
      { label: "Crash Deceleration Zone", value: "32 G Absorptive" },
    ],
    diagramPoints: [
      "Front crash box with sacrificial honeycomb cells",
      "Central survival cell rated for Mach 0.5 birdstrike",
      "Sub-floor battery armor casing with basalt fiber shielding",
    ],
    principles: "Structural topology optimization removes dead mass while channeling impact vectors safely around the two-passenger pressurized capsule.",
  },
  {
    id: "propulsion",
    name: "Dual Induction Ion Thrusters",
    icon: Zap,
    tagline: "High-Density Electromagnetic Thrust",
    coreTech: "Twin counter-rotating magnetic levitation ducted impellers.",
    specs: [
      { label: "Combined Output", value: "12,000 N Thrust" },
      { label: "Spool-up Latency", value: "18 ms Instantaneous" },
      { label: "Impeller Speed", value: "85,000 RPM Max" },
    ],
    diagramPoints: [
      "Magnetic bearing ring with zero mechanical friction",
      "Cold-plasma ionized exhaust plume vectoring nozzles",
      "Dynamic acoustic cancellation baffles (sub-62 dBA at 100m)",
    ],
    principles: "By pre-ionizing boundary layer intake air with pulsed RF fields, the ducted fans achieve supersonic airflow without typical sonic shockwave degradation.",
  },
  {
    id: "battery",
    name: "900V Solid-State Cell Matrix",
    icon: BatteryCharging,
    tagline: "Cryogenic Phase-Change Energy Storage",
    coreTech: "Silicon-anode solid electrolyte cells with 480 Wh/kg specific energy density.",
    specs: [
      { label: "Pack Capacity", value: "140 kWh Nominal" },
      { label: "Fast Charge Cycle", value: "10% to 80% in 12 min" },
      { label: "Thermal Runaway Resistance", value: "Class 0 Flammability" },
    ],
    diagramPoints: [
      "Micro-channel fluoropolymer liquid chilling plates",
      "Pyrotechnic high-speed safety disconnect bus (<2 ms)",
      "Regenerative aerodynamic airbrake kinetic recovery",
    ],
    principles: "Cells operate at a stable 28°C under continuous 8C peak discharge during ascent, utilizing passive heat pipes integrated into the trailing carbon wing edges.",
  },
  {
    id: "avionics",
    name: "Tri-Core Optical Fly-by-Wire",
    icon: Cpu,
    tagline: "Fault-Tolerant Quantum Corridor Radar",
    coreTech: "Triple redundant voting architecture with nanosecond optical LiDAR and satellite mesh.",
    specs: [
      { label: "Telemetry Compute", value: "350 TeraOPS Dual AI" },
      { label: "Corridor Refresh Rate", value: "120 Hz Continuous" },
      { label: "Sensor Convergence", value: "360° Zero Blindspot" },
    ],
    diagramPoints: [
      "Optical fiber harness immune to electromagnetic pulse",
      "Autonomous automated terrain following and obstacle avoidance",
      "Civil Air Traffic Controller TCAS-X digital clearance handshake",
    ],
    principles: "Should two flight computers produce divergent guidance outputs, the hardware voting arbiter isolates the anomaly in sub-millisecond cycles without pilot intervention.",
  },
  {
    id: "safety",
    name: "Ballistic Recovery Parachute & Thruster Reversal",
    icon: ShieldCheck,
    tagline: "Zero-Altitude Escape & Safe Recovery",
    coreTech: "High-altitude rocket-deployed multi-canopy chute paired with emergency retro-burn.",
    specs: [
      { label: "Deployment Envelope", value: "0 to 1,200m AGL" },
      { label: "Touchdown Descent Rate", value: "4.8 m/s Maximum" },
      { label: "Retro-Thrust Cushion", value: "Active Final 3 Meters" },
    ],
    diagramPoints: [
      "Solid-rocket booster launches recovery harness in 0.4s",
      "Airbag skid plates deploy automatically on descent",
      "Satellite emergency beacon transmits encrypted distress beacon",
    ],
    principles: "Even in total primary avionics failure, a dedicated independent analog backup battery initiates soft touchdown sequence automatically.",
  },
];

export default function EngineeringLab() {
  const [activeModuleId, setActiveModuleId] = useState<string>(LAB_MODULES[0].id);
  const activeModule = LAB_MODULES.find((m) => m.id === activeModuleId) || LAB_MODULES[0];

  const handleModuleSelect = (id: string) => {
    sound.playClick();
    setActiveModuleId(id);
  };

  return (
    <section id="engineering-lab" className="relative py-24 md:py-32 bg-[#040406] text-silver overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-[700px] h-[500px] bg-electricBlue/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electricBlue/10 border border-electricBlue/20 text-electricBlue text-xs font-mono tracking-[0.25em] uppercase mb-4">
              <Cpu className="w-3.5 h-3.5" />
              <span>Deep-Tech Research & Development</span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
              ENGINEERING <br />
              <span className="bg-gradient-to-r from-white via-silver to-neutral-500 bg-clip-text text-transparent">
                LABORATORY.
              </span>
            </h2>
          </div>

          <p className="text-sm md:text-base text-silver/75 max-w-md font-light">
            Examine the deep aerospace principles, high-voltage battery architecture, and fail-safe safety mechanisms powering Project Stratos.
          </p>
        </div>

        {/* Module Selector Navigation Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {LAB_MODULES.map((mod) => {
            const Icon = mod.icon;
            const isSelected = mod.id === activeModuleId;
            return (
              <button
                key={mod.id}
                onClick={() => handleModuleSelect(mod.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                  isSelected
                    ? "bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                    : "bg-[#0b0d12] text-neutral-400 hover:text-white border border-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{mod.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Module Engineering Card */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.9)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Subsystem Deep Dive */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-electricBlue font-bold block mb-1">
                {activeModule.tagline}
              </span>
              <h3 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
                {activeModule.name}
              </h3>
              <p className="mt-3 text-base text-silver/80 font-light leading-relaxed">
                {activeModule.principles}
              </p>
            </div>

            {/* Core Tech Breakdown */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                CORE TECHNICAL SPECIFICATION:
              </span>
              <p className="text-sm font-mono text-white font-semibold">
                {activeModule.coreTech}
              </p>
            </div>

            {/* Diagram Schematic Points */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                SUBSYSTEM ARCHITECTURE HIGHLIGHTS:
              </span>
              <div className="space-y-2 font-mono text-xs">
                {activeModule.diagramPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neonRed mt-1.5 shrink-0 shadow-[0_0_6px_#FF2638]" />
                    <span className="text-silver/90 leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Key Engineering Benchmarks & Metrics */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-black/70 border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs">
                <span className="text-electricBlue font-bold uppercase">VALIDATION BENCHMARKS</span>
                <span className="text-neutral-500">LAB TESTED</span>
              </div>

              <div className="space-y-4">
                {activeModule.specs.map((spec, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      {spec.label}
                    </span>
                    <p className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-neonRed/10 border border-neonRed/20 text-[11px] font-mono text-neutral-300">
                <span className="text-neonRed font-bold block mb-0.5">AERON AERO-SAFETY DIRECTIVE</span>
                All subsystems engineered to FAA Part 23 &amp; EASA Special Condition VTOL airworthiness safety standards.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
