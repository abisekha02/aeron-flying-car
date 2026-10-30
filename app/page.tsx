import Navbar from "@/components/Navbar";
import FlyingCarScroll from "@/components/FlyingCarScroll";
import FlightTechnology from "@/components/FlightTechnology";
import SpecsSection from "@/components/SpecsSection";
import CarConfigurator from "@/components/CarConfigurator";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative bg-[#050505] min-h-screen text-silver">
      {/* Navigation */}
      <Navbar />

      {/* Hero & 40-Frame Scrollytelling Experience */}
      <FlyingCarScroll />

      {/* Engineering & Flight Technology */}
      <FlightTechnology />

      {/* Concept Specifications */}
      <SpecsSection />

      {/* Interactive Configurator */}
      <CarConfigurator />

      {/* Final CTA & Footer */}
      <Footer />
    </main>
  );
}
