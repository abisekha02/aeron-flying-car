import Navbar from "@/components/Navbar";
import FlyingCarScroll from "@/components/FlyingCarScroll";
import VehicleViewer3D from "@/components/VehicleViewer3D";
import FlightDashboard from "@/components/FlightDashboard";
import VehicleTransformation from "@/components/VehicleTransformation";
import EngineeringLab from "@/components/EngineeringLab";
import FlightTechnology from "@/components/FlightTechnology";
import SpecsSection from "@/components/SpecsSection";
import CarConfigurator from "@/components/CarConfigurator";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative bg-[#050505] min-h-screen text-silver" style={{ overflowX: "clip" }}>
      {/* Navigation */}
      <Navbar />

      {/* 1. Hero & 40-Frame Cinematic Vector Sequence */}
      <FlyingCarScroll />

      {/* 2. Interactive Real-Time 3D Vehicle Inspection Laboratory */}
      <VehicleViewer3D />

      {/* 3. Flight Simulation Avionics Cockpit Dashboard */}
      <FlightDashboard />

      {/* 4. Ground-to-Air Vehicle Transformation */}
      <VehicleTransformation />

      {/* 5. Deep-Tech Engineering Laboratory */}
      <EngineeringLab />

      {/* 6. Advanced Architecture Pillars */}
      <FlightTechnology />

      {/* 7. Concept Specifications Benchmark */}
      <SpecsSection />

      {/* 8. Interactive Flight Craft Configurator */}
      <CarConfigurator />

      {/* 9. Final Call to Action & Footer */}
      <Footer />
    </main>
  );
}
