"use client";

import React from "react";
import { ArrowUp, Compass, Github, ShieldAlert, Sparkles } from "lucide-react";
import { AERON_CONCEPT_METADATA } from "../data/vehicle";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToConfigurator = () => {
    const el = document.getElementById("configurator");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#030304] text-silver border-t border-white/10 overflow-hidden">
      {/* FINAL CINEMATIC CTA SECTION */}
      <div className="relative py-28 md:py-36 px-6 sm:px-8 max-w-7xl mx-auto text-center flex flex-col items-center justify-center">
        {/* Glow ambient circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-crimson/20 via-neonRed/15 to-electricBlue/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-neonRed" />
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-300">
              Project Stratos Vision
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight text-white leading-none">
            THE FUTURE <br />
            <span className="bg-gradient-to-r from-white via-silver to-neutral-500 bg-clip-text text-transparent">
              DOESN&apos;T FOLLOW ROADS.
            </span>
          </h2>

          <p className="text-base sm:text-xl text-silver/70 font-light max-w-2xl mx-auto leading-relaxed">
            Experience the confluence of high-downforce automotive engineering and stratospheric ion propulsion. The horizon is no longer the limit.
          </p>

          <div className="pt-4">
            <button
              onClick={scrollToConfigurator}
              className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-crimson to-neonRed text-white font-bold text-xs uppercase tracking-[0.25em] shadow-[0_0_35px_rgba(255,38,56,0.45)] hover:shadow-[0_0_50px_rgba(255,38,56,0.8)] transition-all duration-300 active:scale-95"
            >
              <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
              <span>EXPLORE THE CONCEPT</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="border-t border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand & Wordmark */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center space-x-3">
              <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
                <polygon
                  points="16,3 30,27 24,27 16,13 8,27 2,27"
                  fill="url(#footer-grad)"
                />
                <defs>
                  <linearGradient id="footer-grad" x1="2" y1="3" x2="30" y2="27" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" />
                    <stop offset="1" stopColor="#FF2638" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-lg font-black tracking-[0.35em] text-white">
                AERON
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-light max-w-md text-center md:text-left">
              Advanced Atmospheric Automotive Exploration Studio.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs uppercase font-mono tracking-widest text-neutral-400">
            <a href="#experience" className="hover:text-white transition-colors">
              Experience
            </a>
            <a href="#engineering" className="hover:text-white transition-colors">
              Engineering
            </a>
            <a href="#specifications" className="hover:text-white transition-colors">
              Specifications
            </a>
            <a href="#configurator" className="hover:text-white transition-colors">
              Configure
            </a>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white text-xs font-mono uppercase tracking-wider transition-all"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="hidden sm:inline">Top</span>
          </button>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="border-t border-white/5 py-8 px-6 sm:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] font-mono text-neutral-500">
          <p className="max-w-2xl leading-relaxed">
            {AERON_CONCEPT_METADATA.disclaimer} AERON is an independent creative design exercise and is not affiliated with, sponsored by, or endorsed by Tesla, Inc. or any other automotive manufacturer.
          </p>

          <p className="shrink-0">
            &copy; {currentYear} AERON DYNAMICS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
