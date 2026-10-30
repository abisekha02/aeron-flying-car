export interface VehicleSpecCategory {
  category: string;
  items: {
    label: string;
    value: string;
    unit?: string;
    description: string;
    isIllustrative: boolean;
  }[];
}

export interface TechnologyPillar {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  metrics: {
    label: string;
    value: string;
  }[];
  features: string[];
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  secondaryHex: string;
  finish: string;
  description: string;
  ambientLight: string;
}

export interface InteriorOption {
  id: string;
  name: string;
  accent: string;
  materials: string;
}

export interface AeroPackage {
  id: string;
  name: string;
  priceTag: string;
  downforceFactor: string;
  description: string;
}

export const AERON_CONCEPT_METADATA = {
  name: "AERON",
  codename: "Project Stratos 01",
  headline: "THE SKY IS YOURS.",
  tagline: "A new dimension of motion.",
  disclaimer:
    "AERON is an original conceptual design study exploring dual-mode ground-to-air aerodynamic vehicles. All stated figures, dimensional models, and flight envelopes are engineering design targets and illustrative conceptual metrics, not verified production claims.",
};

export const VEHICLE_SPECIFICATIONS: VehicleSpecCategory[] = [
  {
    category: "Propulsion & Flight Dynamics",
    items: [
      {
        label: "Airspeed Target",
        value: "380",
        unit: "km/h",
        description: "Projected cruising flight velocity at nominal operating altitude.",
        isIllustrative: true,
      },
      {
        label: "Service Ceiling",
        value: "3,200",
        unit: "m MSL",
        description: "Optimized operational air corridor envelope for urban and regional skyways.",
        isIllustrative: true,
      },
      {
        label: "Ground Mode Top Speed",
        value: "260",
        unit: "km/h",
        description: "Low-drag tarmac cruising capability with tucked aerodynamic winglets.",
        isIllustrative: true,
      },
      {
        label: "Transition Time",
        value: "3.2",
        unit: "sec",
        description: "Automated ground-to-flight wing deployment and thrust vector rotation.",
        isIllustrative: true,
      },
    ],
  },
  {
    category: "Energy & Range Envelope",
    items: [
      {
        label: "Flight Range",
        value: "640",
        unit: "km",
        description: "Projected single-charge flight radius under FAA reserve guidelines.",
        isIllustrative: true,
      },
      {
        label: "Ground Range",
        value: "820",
        unit: "km",
        description: "High-efficiency regenerative ground drive cruising distance.",
        isIllustrative: true,
      },
      {
        label: "Architecture",
        value: "900",
        unit: "V Solid-State",
        description: "Next-generation structural battery cell integration inside carbon chassis.",
        isIllustrative: true,
      },
      {
        label: "Rapid Re-charge",
        value: "12",
        unit: "min (10-80%)",
        description: "Megawatt dual-coupler conductive charging interface.",
        isIllustrative: true,
      },
    ],
  },
  {
    category: "Architecture & Structural",
    items: [
      {
        label: "Curb Weight",
        value: "1,420",
        unit: "kg",
        description: "Target curb mass utilizing autoclave carbon-titanium composite lattice.",
        isIllustrative: true,
      },
      {
        label: "Cabin Seating",
        value: "2 + 2",
        unit: "Configuration",
        description: "Pressurized tandem layout with panoramic carbon-framed electrochromic canopy.",
        isIllustrative: true,
      },
      {
        label: "Flight Controls",
        value: "Tri-Redundant",
        unit: "Fly-by-Wire",
        description: "AI-assisted neural flight stabilization with full manual override.",
        isIllustrative: true,
      },
      {
        label: "Safety Envelope",
        value: "Ballistic Recovery",
        unit: "Parachute + Airframe",
        description: "Autonomous whole-vehicle multi-stage rocket-assisted descent canopy.",
        isIllustrative: true,
      },
    ],
  },
];

export const TECHNOLOGY_PILLARS: TechnologyPillar[] = [
  {
    id: "aero",
    title: "Aerodynamic Transformation",
    subtitle: "Adaptive Biomimetic Surface",
    description:
      "Engineered with a dual-geometry morphing surface that actively alters its cross-sectional camber. On the road, aerodynamic vortex generators seal laminar flow around the diffuser. In the sky, electro-actuated wings extend with zero mechanical penalty.",
    metrics: [
      { label: "Ground Cd", value: "0.19" },
      { label: "Flight Lift-to-Drag", value: "14.8" },
      { label: "Wing Deploy Time", value: "3.2s" },
    ],
    features: [
      "Active carbon-weave adaptive trailing edge",
      "Vortex-shedding micro-vanes for crosswind damping",
      "Boundary-layer suction integration along the canopy",
    ],
  },
  {
    id: "propulsion",
    title: "Propulsion & Vectoring",
    subtitle: "Distributed Electric Ducted Thrusters",
    description:
      "Four dual-aperture high-pressure electric ducted fans pivot with 3-axis continuous vectoring. Illuminated with cold blue-white ion plasma glow, each nacelle produces instantaneous omni-directional response with whisper-quiet acoustic baffles.",
    metrics: [
      { label: "Total Peak Thrust", value: "24.6 kN" },
      { label: "Acoustic Footprint", value: "< 62 dBA" },
      { label: "Vector Slew Rate", value: "120 deg/s" },
    ],
    features: [
      "Counter-rotating carbon-fiber toroidal fan blades",
      "Liquid-jacketed stator cooling with phase-change heat sinks",
      "Regenerative aerodynamic braking during approach descent",
    ],
  },
  {
    id: "flight-control",
    title: "Neural Flight Envelope",
    subtitle: "Tri-Redundant Autonomy & Telemetry",
    description:
      "A triple-core optical fly-by-wire computer predicts atmospheric turbulence 500 meters ahead using pulsed lidar. Whether navigating dense skyscraper skyways or open coastal horizons, flight paths remain effortlessly stable.",
    metrics: [
      { label: "Sensor Refresh Rate", value: "1,000 Hz" },
      { label: "Turbulence Mitigation", value: "98.4%" },
      { label: "Emergency Failsafe", value: "Quadruple" },
    ],
    features: [
      "Millimeter-wave radar and solid-state 360-degree LiDAR",
      "Dynamic airspace collision avoidance (TCAS-X autonomous)",
      "Zero-pilot workload automated landing on standard helipads",
    ],
  },
  {
    id: "cabin",
    title: "Panoramic Glass Cockpit",
    subtitle: "Pressurized Carbon-Acoustic Sanctuary",
    description:
      "An expansive seamless panoramic glass canopy treated with electrochromic privacy opacity. Inside, twin floating carbon bucket seats adapt to gravitational G-forces during steep climbs, banked curves, and smooth skyward cruising.",
    metrics: [
      { label: "Field of Vision", value: "270 deg" },
      { label: "Canopy Tint Speed", value: "0.2 sec" },
      { label: "Sound Insulation", value: "-44 dB" },
    ],
    features: [
      "Heads-up volumetric holographic flight HUD",
      "Active vibration-cancelling seat suspension",
      "Hypoallergenic pressurized HEPA climate filtration",
    ],
  },
];

export const COLOR_OPTIONS: ColorOption[] = [
  {
    id: "silver",
    name: "Liquid Silver",
    hex: "#DCE1E8",
    secondaryHex: "#8E97A4",
    finish: "Multi-Coat Metallic",
    description: "The signature AERON aesthetic. High-reflectance aircraft-grade silver that catches neon track lights and ambient sky illumination.",
    ambientLight: "#56C8FF",
  },
  {
    id: "obsidian",
    name: "Obsidian Black",
    hex: "#0D0E12",
    secondaryHex: "#1F232B",
    finish: "Deep Satin Stealth",
    description: "An absorbing, stealth-inspired deep black with midnight undertones, emphasizing glowing red ramp reflections and electric blue thruster rings.",
    ambientLight: "#FF2638",
  },
  {
    id: "crimson",
    name: "Apex Crimson",
    hex: "#8B0000",
    secondaryHex: "#FF2638",
    finish: "Infrared Tinted Clearcoat",
    description: "Intense crimson hue inspired by nocturnal launch runways and aerodynamic edge lighting. Radiates high energy in motion.",
    ambientLight: "#FF2638",
  },
  {
    id: "white",
    name: "Starlight White",
    hex: "#F5F7FA",
    secondaryHex: "#D0D6E0",
    finish: "Tri-Coat Pearl Ceramic",
    description: "Crisp architectural white infused with iridescent micro-ceramics, evoking supersonic orbital craft against dark horizons.",
    ambientLight: "#56C8FF",
  },
];

export const INTERIOR_OPTIONS: InteriorOption[] = [
  {
    id: "carbon-alcantara",
    name: "Monochrome Alcantara",
    accent: "Silver Stitching & Raw Matte Carbon",
    materials: "Aerospace recycled technical microfiber with laser-etched cooling micro-perforations.",
  },
  {
    id: "crimson-apex",
    name: "Apex Crimson Trim",
    accent: "Neon Red Piping & Anodized Titanium",
    materials: "Semi-aniline black leather flanked by crimson contrast webbing and milled control surfaces.",
  },
  {
    id: "cyber-blue",
    name: "Skyway Ion Blue",
    accent: "Electric Blue Backlighting & Slate Leather",
    materials: "Cold-touch tactile aluminum dials with illuminated fiber-optic seat inserts.",
  },
];

export const AERO_PACKAGES: AeroPackage[] = [
  {
    id: "gt-aero",
    name: "Standard Velocity Aero",
    priceTag: "Included Concept Spec",
    downforceFactor: "1.0x Dynamic",
    description: "Balanced dual-mode configuration tuned for high-speed motorway cruising and standard airspace corridors.",
  },
  {
    id: "apex-track",
    name: "Apex Vector Track Pack",
    priceTag: "Performance Concept Spec",
    downforceFactor: "1.45x High-Downforce",
    description: "Extended carbon front canards, aggressive rear diffuser vortex blades, and high-altitude vortex winglet tips.",
  },
];
