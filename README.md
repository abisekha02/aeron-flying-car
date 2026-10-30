# AERON — The Sky Is Yours
### Futuristic Flying Sports Car Cinematic Web Experience

AERON is a premium, cinematic web experience designed to showcase an original dual-mode ground-to-air flying sports car concept.

Built from scratch with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **HTML5 Canvas**.

---

## Features

- **40-Frame Canvas Scrollytelling**:
  - Sticky full-screen HTML5 Canvas mapped across a 500vh scroll container.
  - Smooth bi-directional playback (forward and reverse) tied to scroll velocity.
  - High-DPI screen scaling, aspect-ratio preservation, and efficient `requestAnimationFrame` drawing.
  - Sequence breakdown:
    - **Frames 1–6**: Runway approach & tarmac acceleration
    - **Frames 7–14**: Climbing the curved ramp with illuminated red rails
    - **Frames 15–20**: Inverted zero-G dynamics along the ramp apex
    - **Frames 21–25**: Ramp departure, aerodynamic wing deployment & upright roll
    - **Frames 26–34**: High-velocity cruising with glowing ion-plasma thrusters
    - **Frames 35–40**: Terminal descent and precision landing
  - Polished procedural Canvas fallback with real-time vector rendering in case frame assets are missing.
- **Cinematic Text Overlays**:
  - Synchronized phase cards with Framer Motion vertical float and fade transitions.
- **Interactive Flight Telemetry HUD**:
  - Live velocity, altitude, thrust percentage, and narrative phase indicators.
- **Flight Engineering Pillars**:
  - Editorial deep dives into aerodynamic transformation, vector ducted thrusters, optical fly-by-wire flight control, and pressurized electrochromic cockpit sanctuary.
- **Concept Specifications**:
  - Filterable performance envelopes clearly marked as conceptual targets.
- **Interactive Configurator**:
  - Local-state studio with exterior finishes (Liquid Silver, Obsidian Black, Starlight White, Apex Crimson), interior sanctuaries, aerodynamic packages, and active SVG vector chassis previews.
- **Static Export Ready**:
  - Configured with `output: 'export'` and `images: { unoptimized: true }` for seamless static hosting.

---

## Image Assets

The 40 cinematic frames are located at:
```text
public/images/aeron/1.webp through public/images/aeron/40.webp
```
(Matching `.jpg` fallback formats are also supported).

If replacing or adding custom frames:
Place your 40 sequentially numbered frames (`1.webp` through `40.webp`) in `public/images/aeron/`.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production (Static Export)

```bash
npm run build
```

The static production site will be compiled into the `out/` directory.

---

## Architecture & Code Quality

- **Strict TypeScript**: Fully typed component props, data models, and event handlers.
- **Reduced Motion Support**: Detects `prefers-reduced-motion` and scales down motion.
- **Autonomous & Zero-Dependency Backend**: No external APIs or database required.
- **Original Concept**: AERON is an independent automotive design study and does not use Tesla trademarks or present itself as a Tesla product.
