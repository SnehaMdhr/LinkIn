import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import RegisterPage from "./pages/registerPage";
import LoginPage from "./pages/loginPage";
import DashboardPage from "./pages/dashboardPage";
import ProfilePage from "./pages/profilePage";
import AddLinkPage from "./pages/addLinkPage";
import EditLinkPage from "./pages/editLinkPage";
import PublicProfilePage from "./pages/publicProfilePage";
import NotFoundPage from "./pages/notFoundPage";

import AdminDashboardPage from "./pages/admin/adminDashboardPage";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* User routes (no auth protection yet — Day 1) */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/links/add" element={<AddLinkPage />} />
      <Route path="/links/edit/:id" element={<EditLinkPage />} />

      {/* Public profile (e.g. linkin.com/sneha) */}
      <Route path="/:username" element={<PublicProfilePage />} />

      {/* Admin routes (no RBAC yet — role check only, added in Step 12) */}
      <Route path="/admin" element={<AdminDashboardPage />} />

      {/* 404 fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;