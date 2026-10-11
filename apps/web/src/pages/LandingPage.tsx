// apps/web/src/pages/LandingPage.tsx
import React from "react";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { CapabilityStrip } from "../components/landing/CapabilityStrip";
import { ProblemSolutionSection } from "../components/landing/ProblemSolutionSection";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { ScenarioLabPreview } from "../components/landing/ScenarioLabPreview";
import { ExplainabilitySection } from "../components/landing/ExplainabilitySection";
import { FinalCTA } from "../components/landing/FinalCTA";
import { Footer } from "../components/landing/Footer";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CapabilityStrip />
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
