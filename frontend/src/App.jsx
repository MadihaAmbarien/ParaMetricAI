import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/Dashboard";
import NutritionPage from "./pages/NutritionPage";
import FatiguePage from "./pages/FatiguePage";
import RoutinePage from "./pages/RoutinePage";
import InjuryPage from "./pages/InjuryPage";

function PrivateRoute({ children }) {
  return localStorage.getItem("profile_id") ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="nutrition" element={<NutritionPage />} />
          <Route path="fatigue" element={<FatiguePage />} />
          <Route path="routine" element={<RoutinePage />} />
          <Route path="injury" element={<InjuryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
