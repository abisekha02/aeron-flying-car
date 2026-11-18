"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gauge,
  Plane,
  Car,
  Compass,
  Zap,
  Thermometer,
  BatteryCharging,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { sound } from "../utils/audio";

type FlightMode = "road" | "transition" | "flight" | "landing";

interface ModeTelemetry {
  speed: number;
  altitude: number;
  battery: number;
  thrust: number;
  temperature: number;
  wingSweep: string;
  liftVector: string;
  statusBadge: string;
  accelG: number;
}

const MODE_CONFIGS: Record<FlightMode, ModeTelemetry> = {
  road: {
    speed: 185,
    altitude: 0,
    battery: 94,
    thrust: 28,
    temperature: 42,
    wingSweep: "0° STOWED",
    liftVector: "DOWNFORCE (450 KG)",
    statusBadge: "GROUND TRACTION ACTIVE",
    accelG: 1.1,
  },
  transition: {
    speed: 260,
    altitude: 45,
    battery: 89,
    thrust: 88,
    temperature: 58,
    wingSweep: "18° DEPLOYING",
    liftVector: "GROUND-TO-AIR VECTORING",
    statusBadge: "MORPHING MORPH ENVELOPE",
    accelG: 2.8,
  },
  flight: {
    speed: 380,
    altitude: 540,
    battery: 81,
    thrust: 95,
    temperature: 64,
    wingSweep: "35° CRUISE DELTA",
    liftVector: "STRATOSPHERIC ZERO-G",
    statusBadge: "ION PROPULSION CRUISE",
    accelG: 1.4,
  },
  landing: {
    speed: 120,
    altitude: 18,
    battery: 76,
    thrust: 45,
    temperature: 49,
    wingSweep: "12° AIRBRAKE EXTENDED",
    liftVector: "REVERSE THRUST DAMPING",
    statusBadge: "TERMINAL GUIDANCE LOCK",
    accelG: 0.9,
  },
};

export default function FlightDashboard() {
  const [activeMode, setActiveMode] = useState<FlightMode>("flight");
  const [currentTelemetry, setCurrentTelemetry] = useState<ModeTelemetry>(MODE_CONFIGS["flight"]);
  const [hudTick, setHudTick] = useState(0);

  // Micro-fluctuation simulation for high-precision live avionics feel
  useEffect(() => {
    const interval = setInterval(() => {
      setHudTick((t) => t + 1);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleModeChange = (mode: FlightMode) => {
    sound.playChime(mode === "flight" ? 850 : mode === "transition" ? 700 : 520, "triangle", 0.25);
    setActiveMode(mode);
    setCurrentTelemetry(MODE_CONFIGS[mode]);
  };

  const target = currentTelemetry;
  // Apply minor realistic jitter to numbers for authentic cockpit feel
  const jitterSpeed = Math.round(target.speed + (Math.sin(hudTick * 0.8) * 3));
  const jitterAltitude = Math.round(target.altitude + (target.altitude > 0 ? Math.sin(hudTick * 0.5) * 4 : 0));
  const jitterThrust = Math.round(target.thrust + Math.sin(hudTick * 1.2) * 1.5);
  const jitterTemp = Math.round(target.temperature + Math.sin(hudTick * 0.3) * 0.8);

  return (
    <section id="flight-dashboard" className="relative py-24 md:py-32 bg-[#06070a] text-silver overflow-hidden">
      {/* Background HUD Grid */}
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-electricBlue/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electricBlue/10 border border-electricBlue/20 text-electricBlue text-xs font-mono tracking-[0.25em] uppercase mb-4">
              <Activity className="w-3.5 h-3.5" />
              <span>Avionics & Flight Operations Simulation</span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
              FLIGHT MODE <br />
              <span className="bg-gradient-to-r from-white via-silver to-neutral-500 bg-clip-text text-transparent">
                COCKPIT TELEMETRY.
              </span>
            </h2>
          </div>

          <div className="p-3 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-neutral-400 max-w-sm">
            <span className="text-neonRed font-bold block uppercase mb-1">
              [DISCLAIMER // SIMULATED TELEMETRY]
            </span>
            All flight dynamics, battery draw curves, and airspeed envelopes represent engineering design targets and simulated telemetry.
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {(["road", "transition", "flight", "landing"] as FlightMode[]).map((mode) => {
            const isCurrent = activeMode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                  isCurrent
                    ? "bg-[#111319] border-electricBlue shadow-[0_0_25px_rgba(86,200,255,0.25)]"
                    : "bg-[#0a0c10] border-white/10 hover:border-white/20 text-neutral-400 hover:text-white"
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-electricBlue to-neonRed" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                    MODE 0{(["road", "transition", "flight", "landing"].indexOf(mode)) + 1}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isCurrent ? "bg-electricBlue animate-pulse" : "bg-neutral-600"}`} />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  {mode.toUpperCase()} MODE
                </h4>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5 truncate">
                  {MODE_CONFIGS[mode].statusBadge}
                </p>
              </button>
            );
          })}
        </div>

        {/* Main Avionics Glass Cockpit Dashboard Panel */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.9)] space-y-8">
          {/* Top Status Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-electricBlue animate-pulse shadow-[0_0_10px_#56C8FF]" />
              <span className="text-white font-bold tracking-widest uppercase">
                AERON STRATOS AVIONICS OS // v3.8.4
              </span>
              <span className="text-neutral-500">//</span>
              <span className="text-electricBlue font-bold">{target.statusBadge}</span>
            </div>

            <div className="flex items-center gap-4 text-neutral-400 text-[11px]">
              <span>WING CAMBER: <strong className="text-white">{target.wingSweep}</strong></span>
              <span>LIFT ENVELOPE: <strong className="text-white">{target.liftVector}</strong></span>
            </div>
          </div>

          {/* Primary Flight Telemetry Gauges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Speedometer */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
              <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-electricBlue" />
                  <span>AIRSPEED</span>
                </span>
                <span className="text-[10px] text-electricBlue">IAS</span>
              </div>
              <div className="my-2">
                <div className="text-4xl lg:text-5xl font-black font-mono text-white tracking-tight">
                  {jitterSpeed}
                </div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">KILOMETERS / HOUR</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-electricBlue to-neonRed transition-all duration-500"
                  style={{ width: `${(jitterSpeed / 420) * 100}%` }}
                />
              </div>
            </div>

            {/* 2. Altimeter */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
              <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                <span className="flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-electricBlue" />
                  <span>ALTITUDE (MSL)</span>
                </span>
                <span className="text-[10px] text-electricBlue">METRIC</span>
              </div>
              <div className="my-2">
                <div className="text-4xl lg:text-5xl font-black font-mono text-electricBlue tracking-tight">
                  {jitterAltitude}
                </div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">METERS AGL</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-electricBlue transition-all duration-500"
                  style={{ width: `${(jitterAltitude / 600) * 100}%` }}
                />
              </div>
            </div>

            {/* 3. Thrust Output */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
              <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-neonRed" />
                  <span>ION THRUST</span>
                </span>
                <span className="text-[10px] text-neonRed">12 kN MAX</span>
              </div>
              <div className="my-2">
                <div className="text-4xl lg:text-5xl font-black font-mono text-neonRed tracking-tight">
                  {jitterThrust}%
                </div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">DUAL DUCTED FANS</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neonRed transition-all duration-500"
                  style={{ width: `${jitterThrust}%` }}
                />
              </div>
            </div>

            {/* 4. High-Voltage Battery */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
              <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                <span className="flex items-center gap-1.5">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BATTERY SOC</span>
                </span>
                <span className="text-[10px] text-emerald-400">900V DC</span>
              </div>
              <div className="my-2">
                <div className="text-4xl lg:text-5xl font-black font-mono text-white tracking-tight">
                  {target.battery}%
                </div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">SOLID STATE PACK</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${target.battery}%` }}
                />
              </div>
            </div>

            {/* 5. Inverter Temperature */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
              <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>CORE TEMP</span>
                </span>
                <span className="text-[10px] text-amber-400">NOMINAL</span>
              </div>
              <div className="my-2">
                <div className="text-4xl lg:text-5xl font-black font-mono text-silver tracking-tight">
                  {jitterTemp}°C
                </div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">CRYOGENIC COOLING</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${(jitterTemp / 90) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Artificial Horizon & Corridor Visualizer */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-black/80 via-black/40 to-black/80 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start text-electricBlue font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>TRIPLE REDUNDANT AUTONOMOUS SKYWAY CORRIDOR LOCK</span>
              </div>
              <p className="text-silver/70 font-light text-[11px] max-w-lg">
                LiDAR optical correlation aligns flight trajectory with designated civil airspace pathways at 100 Hz refresh rate.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-center">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 min-w-[100px]">
                <p className="text-[10px] text-neutral-400 uppercase">LOAD FACTOR</p>
                <p className="text-lg font-bold text-white font-mono">+{target.accelG} G</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 min-w-[100px]">
                <p className="text-[10px] text-neutral-400 uppercase">YAW TRIM</p>
                <p className="text-lg font-bold text-electricBlue font-mono">0.00°</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 min-w-[100px]">
                <p className="text-[10px] text-neutral-400 uppercase">SAFETY BUS</p>
                <p className="text-lg font-bold text-emerald-400 font-mono">ONLINE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
