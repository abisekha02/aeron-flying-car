"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, Compass, Volume2, VolumeX, Sparkles } from "lucide-react";
import { sound } from "../utils/audio";
import ReserveModal from "./ReserveModal";

interface NavItem {
  name: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Experience", href: "#experience" },
  { name: "3D Vehicle", href: "#vehicle-3d" },
  { name: "Cockpit", href: "#flight-dashboard" },
  { name: "Transition", href: "#transformation" },
  { name: "Engineering", href: "#engineering-lab" },
  { name: "Specifications", href: "#specifications" },
  { name: "Configure", href: "#configurator" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Simple active link spy
      const sections = ["experience", "vehicle-3d", "flight-dashboard", "transformation", "engineering-lab", "specifications", "configurator"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const scrollTo = (href: string) => {
    sound.playClick();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#050505]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3.5"
            : "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          {/* AERON Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              sound.playClick();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group flex items-center space-x-3.5 focus:outline-none"
            aria-label="AERON Home"
          >
            {/* Futuristic geometric flight wing glyph */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                className="w-full h-full transition-transform duration-500 group-hover:scale-110"
              >
                <polygon
                  points="16,3 30,27 24,27 16,13 8,27 2,27"
                  fill="url(#aeron-gradient)"
                  className="transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,38,56,0.8)]"
                />
                <line
                  x1="16"
                  y1="13"
                  x2="16"
                  y2="29"
                  stroke="#56C8FF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="opacity-80 group-hover:stroke-neonRed transition-colors duration-300"
                />
                <defs>
                  <linearGradient id="aeron-gradient" x1="2" y1="3" x2="30" y2="27" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" />
                    <stop offset="0.6" stopColor="#DCE1E8" />
                    <stop offset="1" stopColor="#FF2638" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-[0.35em] text-white group-hover:text-silver transition-colors">
                AERON
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-light -mt-0.5">
                Flight Dynamics
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-5 py-1.5 backdrop-blur-md">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href.replace("#", "");
              return (
                <button
                  key={item.name}
                  onClick={() => scrollTo(item.href)}
                  className={`relative px-4 py-1.5 text-xs tracking-[0.18em] uppercase font-medium transition-all duration-300 rounded-full ${
                    isActive
                      ? "text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-white/10 rounded-full border border-white/20 transition-all" />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Right CTA + Sound Toggle */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Audio Toggle Button */}
            <button
              onClick={toggleSound}
              title={isMuted ? "Enable Ambient Audio" : "Mute Audio"}
              className={`p-2 rounded-full border transition-all ${
                !isMuted
                  ? "bg-electricBlue/20 border-electricBlue text-electricBlue shadow-[0_0_12px_rgba(86,200,255,0.4)]"
                  : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
              }`}
            >
              {!isMuted ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Pre-Order / Reserve Button */}
            <button
              onClick={() => {
                sound.playClick();
                setReserveModalOpen(true);
              }}
              className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-full overflow-hidden text-xs font-semibold uppercase tracking-[0.18em] text-white bg-gradient-to-r from-crimson to-neonRed hover:from-neonRed hover:to-crimson transition-all duration-300 shadow-[0_0_20px_rgba(255,38,56,0.3)] hover:shadow-[0_0_30px_rgba(255,38,56,0.6)] active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
              <span>Reserve</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg text-neutral-300 hover:text-white bg-white/5 border border-white/10"
              aria-label="Toggle Audio"
            >
              {!isMuted ? <Volume2 className="w-4 h-4 text-electricBlue" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[60px] bg-[#08090C]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-8 flex flex-col space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollTo(item.href)}
                className="flex items-center justify-between text-left py-3 border-b border-white/5 text-sm uppercase tracking-[0.2em] font-medium text-neutral-300 hover:text-neonRed transition-colors"
              >
                <span>{item.name}</span>
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </button>
            ))}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setReserveModalOpen(true);
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-crimson to-neonRed text-white text-xs uppercase tracking-[0.2em] font-semibold shadow-[0_0_20px_rgba(255,38,56,0.4)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Reserve Stratos 01</span>
            </button>
          </div>
        )}
      </header>

      {/* Reservation Dialog Modal */}
      <ReserveModal isOpen={reserveModalOpen} onClose={() => setReserveModalOpen(false)} />
    </>
  );
}
