// apps/web/src/pages/DashboardView.tsx
// Seamless wrapper maintaining existing imports while providing the complete DashboardLayout & RecommendationsView

import React from "react";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { RecommendationsView } from "../components/dashboard/RecommendationsView";

export const DashboardView: React.FC = () => {
  return (
    <DashboardLayout>
      <RecommendationsView />
    </DashboardLayout>
  );
};

export default DashboardView;
