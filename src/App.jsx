import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import TextOnlyLayout from "./layouts/TextOnlyLayout.jsx";
import { useTheme } from "./hooks/useTheme.js";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const WorkdayPage = lazy(() => import("./pages/WorkdayPage.jsx"));
const SalaryTakeHomePage = lazy(() => import("./pages/SalaryTakeHomePage.jsx"));
const GenericCalculatorPage = lazy(() => import("./pages/GenericCalculatorPage.jsx"));
const TextOnlyDashboard = lazy(() => import("./pages/TextOnlyDashboard.jsx"));
const TextOnlyCalculatorPage = lazy(() => import("./pages/TextOnlyCalculatorPage.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
  useTheme();

  return (
    <Suspense fallback={<div className="route-loader">Loading calculator...</div>}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="calculators/workday" element={<WorkdayPage />} />
          <Route path="calculators/salary-take-home" element={<SalaryTakeHomePage />} />
          <Route path="calculators/:calculatorId" element={<GenericCalculatorPage />} />
          <Route path="calculators" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="text" element={<TextOnlyLayout />}>
          <Route index element={<TextOnlyDashboard />} />
          <Route path="calculators/:calculatorId" element={<TextOnlyCalculatorPage />} />
          <Route path="calculators" element={<Navigate to="/text" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
