import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: {
          DEFAULT: "#0B0C0E",
          card: "#111317",
          border: "#1C2028",
          hover: "#1A1D24",
        },
        crimson: {
          DEFAULT: "#8B0000",
          dark: "#5A0000",
          glow: "rgba(139, 0, 0, 0.4)",
        },
        neonRed: {
          DEFAULT: "#FF2638",
          glow: "rgba(255, 38, 56, 0.35)",
        },
        electricBlue: {
          DEFAULT: "#56C8FF",
          glow: "rgba(86, 200, 255, 0.4)",
        },
        silver: {
          light: "#F0F3F7",
          DEFAULT: "#DCE1E8",
          dark: "#8E97A4",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        outfit: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neon-red": "0 0 25px rgba(255, 38, 56, 0.4)",
        "neon-blue": "0 0 25px rgba(86, 200, 255, 0.4)",
        "crimson-glow": "0 0 35px rgba(139, 0, 0, 0.5)",
      },
      backgroundImage: {
        "radial-glow": "radial-gradient(circle at center, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
