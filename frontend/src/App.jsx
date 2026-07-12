import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import RegisterPage from "./pages/registerPage";
import LoginPage from "./pages/loginPage";
import ForgotPasswordPage from "./pages/forgotPasswordPage";
import ResetPasswordPage from "./pages/resetPasswordPage";
import DashboardPage from "./pages/dashboardPage";
import ProfilePage from "./pages/profilePage";
import AddLinkPage from "./pages/addLinkPage";
import EditLinkPage from "./pages/editLinkPage";
import PublicProfilePage from "./pages/publicProfilePage";
import NotFoundPage from "./pages/notFoundPage";
import AboutPage from "./pages/aboutPage";
import ContactPage from "./pages/contactPage";
import PrivacyPage from "./pages/privacyPage";
import TermsPage from "./pages/termsPage";

import AdminDashboardPage from "./pages/admin/adminDashboardPage";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />

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