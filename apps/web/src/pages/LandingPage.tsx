// apps/web/src/pages/LandingPage.tsx
import React from "react";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { CapabilityStrip } from "../components/landing/CapabilityStrip";
import { InventorySimulation } from "../components/landing/InventorySimulation";
import { ProblemSolutionSection } from "../components/landing/ProblemSolutionSection";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { ScenarioLabPreview } from "../components/landing/ScenarioLabPreview";
import { ExplainabilitySection } from "../components/landing/ExplainabilitySection";
import { FinalCTA } from "../components/landing/FinalCTA";
import { Footer } from "../components/landing/Footer";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-[#171717] selection:bg-[#171717] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CapabilityStrip />
        <InventorySimulation />
        <ProblemSolutionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ScenarioLabPreview />
        <ExplainabilitySection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
