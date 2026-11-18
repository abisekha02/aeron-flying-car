"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ShieldCheck, Sparkles, Plane, ArrowRight, Lock } from "lucide-react";
import { sound } from "../utils/audio";

interface ReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColorName?: string;
}

export default function ReserveModal({ isOpen, onClose, selectedColorName = "Liquid Silver" }: ReserveModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    region: "North America",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playChime(750, "triangle", 0.3);
    setSubmitted(true);
    setTimeout(() => {
      // auto close or reset
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-xl glass-panel rounded-3xl border border-white/15 p-6 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] z-10 overflow-hidden"
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neonRed via-white to-electricBlue" />

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {!submitted ? (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neonRed/10 border border-neonRed/20 text-neonRed text-[11px] font-mono tracking-widest uppercase mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Project Stratos 01 // Priority Allocation</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                    RESERVE YOUR AERON.
                  </h3>
                  <p className="text-xs sm:text-sm text-silver/80 mt-1">
                    Secure an early production allocation for the dual-mode ground-to-air flight craft.
                  </p>
                </div>

                {/* Configuration Summary Card */}
                <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs font-mono">
                  <div>
                    <p className="text-neutral-400 text-[10px]">CURRENT SPECIFICATION</p>
                    <p className="text-white font-bold uppercase">{selectedColorName} // APEX AERO</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-400 text-[10px]">ESTIMATED TARGET</p>
                    <p className="text-electricBlue font-bold">$1,250,000 USD</p>
                  </div>
                </div>

                {/* Reservation Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                        First Name
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Elena"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-neonRed text-white text-xs outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                        Last Name
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Vance"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-neonRed text-white text-xs outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="elena@stratos-aero.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-neonRed text-white text-xs outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Flight Certification Region
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-white/10 focus:border-neonRed text-white text-xs outline-none transition-colors"
                    >
                      <option value="North America">North America (FAA Skyway Corridor)</option>
                      <option value="Europe">Europe (EASA Urban Air Mobility)</option>
                      <option value="Asia Pacific">Asia Pacific (Civil Aviation Authority)</option>
                      <option value="Middle East">Middle East (Autonomous Aerial Transit)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-gradient-to-r from-crimson to-neonRed text-white font-bold text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,38,56,0.5)] hover:shadow-[0_0_40px_rgba(255,38,56,0.8)] transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span>CONFIRM PRIORITY ALLOCATION</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500 pt-1">
                    <Lock className="w-3 h-3 text-neutral-400" />
                    <span>No deposit required today // Fully refundable allocation placeholder</span>
                  </div>
                </form>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-neonRed/10 border border-neonRed text-neonRed flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,38,56,0.5)]">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                  ALLOCATION CONFIRMED
                </h3>
                <p className="text-xs sm:text-sm text-silver/80 max-w-sm mx-auto">
                  Thank you, <span className="text-white font-semibold">{formData.firstName}</span>. Your reservation token <code className="text-electricBlue font-mono">#STRATOS-0089</code> has been logged. Our concierge will contact you with private preview details.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  Return to Experience
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
