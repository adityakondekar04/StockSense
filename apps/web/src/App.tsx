// apps/web/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DashboardView } from "./pages/DashboardView";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/recommendations" element={<DashboardView />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
