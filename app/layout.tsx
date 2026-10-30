import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AERON | The Sky Is Yours — Futuristic Flying Sports Car Concept",
  description:
    "Experience AERON: an original cinematic dual-mode ground-to-air flying sports car concept. Featuring adaptive aerodynamic transformation, multi-axis ion propulsion, and panoramic glass canopy.",
  keywords: [
    "AERON",
    "flying car",
    "eVTOL concept",
    "futuristic automotive",
    "aerodynamic design",
    "luxury flight",
  ],
  authors: [{ name: "AERON Advanced Design Studio" }],
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${outfit.variable}`}>
      <body className="min-h-screen bg-background text-silver font-sans antialiased selection:bg-neonRed selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
