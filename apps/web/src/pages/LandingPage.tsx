// apps/web/src/pages/LandingPage.tsx
// StockSense Minimalist Website — Redesigned into 4 concise editorial sections

import React from "react";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { ProblemSection } from "../components/landing/ProblemSection";
import { WorkflowSection } from "../components/landing/WorkflowSection";
import { CapabilitiesSection } from "../components/landing/CapabilitiesSection";
import { FinalCTA } from "../components/landing/FinalCTA";
import { Footer } from "../components/landing/Footer";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0a0a0a] text-[#171717] dark:text-[#f5f5f5] selection:bg-[#171717] selection:text-white dark:selection:bg-[#f5f5f5] dark:selection:text-[#0a0a0a] transition-colors duration-150">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section with lightweight InventorySignalAnimation */}
        <HeroSection />

        {/* Section A — The inventory problem */}
        <ProblemSection />

        {/* Section B — How StockSense works */}
        <WorkflowSection />

        {/* Section C — Core capabilities */}
        <CapabilitiesSection />

        {/* Section D — Final CTA */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
