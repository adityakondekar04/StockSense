// apps/web/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { InventoryProvider } from "./context/InventoryContext";
import { LandingPage } from "./pages/LandingPage";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { RecommendationsView } from "./components/dashboard/RecommendationsView";
import { ProductsDirectoryView } from "./components/dashboard/ProductsDirectoryView";
import { ProductDetailView } from "./components/dashboard/ProductDetailView";
import { CleaningView } from "./components/dashboard/CleaningView";
import { ForecastView } from "./components/dashboard/ForecastView";
import { ScenarioView } from "./components/dashboard/ScenarioView";
import { SetupView } from "./components/dashboard/SetupView";
import { AuditView } from "./components/dashboard/AuditView";
import { MethodologyView } from "./components/dashboard/MethodologyView";
import { PrintReportView } from "./components/dashboard/PrintReportView";

export function App() {
  return (
    <BrowserRouter>
      <InventoryProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Primary Replenishment Recommendations Screen */}
          <Route
            path="/recommendations"
            element={
              <DashboardLayout>
                <RecommendationsView />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <RecommendationsView />
              </DashboardLayout>
            }
          />

          {/* Dedicated Products Catalog Directory */}
          <Route
            path="/products"
            element={
              <DashboardLayout>
                <ProductsDirectoryView />
              </DashboardLayout>
            }
          />

          {/* Dedicated 360° Product Detail Page */}
          <Route
            path="/products/:id"
            element={
              <DashboardLayout>
                <ProductDetailView />
              </DashboardLayout>
            }
          />

          {/* Screen 2: Data Cleaning & Anomalies */}
          <Route
            path="/products/:id/cleaning"
            element={
              <DashboardLayout>
                <CleaningView />
              </DashboardLayout>
            }
          />
          <Route
            path="/cleaning"
            element={
              <DashboardLayout>
                <CleaningView />
              </DashboardLayout>
            }
          />

          {/* Screen 3: Forecast Check & Validation */}
          <Route
            path="/products/:id/forecast"
            element={
              <DashboardLayout>
                <ForecastView />
              </DashboardLayout>
            }
          />
          <Route
            path="/forecast"
            element={
              <DashboardLayout>
                <ForecastView />
              </DashboardLayout>
            }
          />

          {/* Screen 5: Scenario Stress Lab */}
          <Route
            path="/products/:id/scenario"
            element={
              <DashboardLayout>
                <ScenarioView />
              </DashboardLayout>
            }
          />
          <Route
            path="/scenario"
            element={
              <DashboardLayout>
                <ScenarioView />
              </DashboardLayout>
            }
          />

          {/* Screen 1 & 1b: Setup & Manual Ingestion */}
          <Route
            path="/setup"
            element={
              <DashboardLayout>
                <SetupView />
              </DashboardLayout>
            }
          />
          <Route
            path="/setup/manual"
            element={
              <DashboardLayout>
                <SetupView />
              </DashboardLayout>
            }
          />

          {/* Screen 7: Decision Log & Audit Trail */}
          <Route
            path="/audit"
            element={
              <DashboardLayout>
                <AuditView />
              </DashboardLayout>
            }
          />

          {/* Screen 6: Mathematical Methodology & Whitepaper */}
          <Route
            path="/methodology"
            element={
              <DashboardLayout>
                <MethodologyView />
              </DashboardLayout>
            }
          />

          {/* Screen 8: Print 1-Page Report */}
          <Route path="/report/:id" element={<PrintReportView />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </InventoryProvider>
    </BrowserRouter>
  );
}

export default App;
