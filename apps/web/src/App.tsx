import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { InventoryProvider } from "./context/InventoryContext";
import { LandingPage } from "./pages/LandingPage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { RecommendationsView } from "./components/dashboard/RecommendationsView";
import { ProductsDirectoryView } from "./components/dashboard/ProductsDirectoryView";
import { ProductDetailView } from "./components/dashboard/ProductDetailView";
import { CleaningView } from "./components/dashboard/CleaningView";
import { ForecastView } from "./components/dashboard/ForecastView";
import { ScenarioView } from "./components/dashboard/ScenarioView";
import { SetupView } from "./components/dashboard/SetupView";
import { AuditView } from "./components/dashboard/AuditView";
import { PrintReportView } from "./components/dashboard/PrintReportView";

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <InventoryProvider>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Standalone Mathematical Methodology Page (Separate from Dashboard) */}
              <Route path="/methodology" element={<MethodologyPage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

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

              {/* Screen 2: Sales & Anomalies (Data Cleaning) */}
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

              {/* Screen 3: Demand Forecast & Validation */}
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

              {/* Screen 1 & 1b: Import Data & Manual Setup */}
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

              {/* Screen 8: Print 1-Page Report */}
              <Route path="/report/:id" element={<PrintReportView />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </InventoryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
