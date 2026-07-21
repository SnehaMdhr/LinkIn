import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Paintbrush,
  Square,
  Palette,
  Type,
  Layout,
  Sparkles,
  SlidersHorizontal,
  Monitor,
  Smartphone,
  Save,
  RotateCcw,
  Eye,
} from "lucide-react";
import { AuthContext } from "../context/authContext";
import { useToast } from "../context/toastContext";
import { getLinks } from "../services/linkServices";
import {
  getCustomization,
  updateCustomization,
  resetCustomization,
} from "../services/customizationServices";
import { DEFAULT_CUSTOMIZATION } from "../config/customization";
import CustomizationPanel from "../components/customize/CustomizationPanel";
import LivePreview from "../components/customize/LivePreview";
import { Button } from "../components/ui/button";
import ThemeDropdown from "../components/ThemeDropdown";
import ProfileEditModal from "../components/ProfileEditModal";
import ActivityLogDialog from "../components/ActivityLogDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import logo from "../assets/logo_only.png";

const SIDEBAR_ITEMS = [
  { id: "appearance", icon: Paintbrush, label: "Appearance" },
  { id: "card", icon: Square, label: "Card" },
  { id: "accent", icon: Palette, label: "Accent Color" },
  { id: "textColor", icon: Paintbrush, label: "Text Colors" },
  { id: "typography", icon: Type, label: "Typography" },
  { id: "layout", icon: Layout, label: "Layout" },
  { id: "buttons", icon: SlidersHorizontal, label: "Buttons" },
  { id: "visibility", icon: Eye, label: "Visibility" },
  { id: "animation", icon: Sparkles, label: "Animation" },
];

function CustomizeProfilePage() {
  const { user, loading: authLoading, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const [customization, setCustomization] = useState(DEFAULT_CUSTOMIZATION);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("appearance");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [resetOpen, setResetOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/"); return; }
    loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [custData, linksData] = await Promise.all([
        getCustomization().catch(() => DEFAULT_CUSTOMIZATION),
        getLinks().catch(() => []),
      ]);
      setCustomization({ ...DEFAULT_CUSTOMIZATION, ...custData });
      setLinks(linksData);
    } catch {
      toast.error("Failed to load customization.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((field, value) => {
    setCustomization((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateCustomization(customization);
      if (response.user) login({ ...user, ...response.user });
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to save customization.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await resetCustomization();
      setCustomization(DEFAULT_CUSTOMIZATION);
      if (response.user) login({ ...user, ...response.user });
      toast.success("Restored default appearance.");
    } catch {
      toast.error("Failed to reset customization.");
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2.5">
            <img src={logo} alt="LinkIn" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-black dark:text-white">Link</span>
              <span className="text-[#AFF33E]">In</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <ThemeDropdown />
            <Button variant="outline" size="sm" onClick={() => setProfileOpen(true)}>
              Edit Profile
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/customize-profile")}>
              Customize Profile
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActivityLogOpen(true)}>
              Activity Log
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLogoutConfirm(true)} className="text-destructive hover:text-destructive">
              Logout
            </Button>
          </div>
        </nav>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#AFF33E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          {/* ── Left Sidebar ── */}
          <aside className="shrink-0 w-[72px] border-r border-border bg-card/50 flex flex-col items-center gap-1 py-4 overflow-y-auto">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  title={item.label}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-medium leading-none">{item.label}</span>
                </button>
              );
            })}
          </aside>

          {/* ── Middle Panel ── */}
          <div className="shrink-0 w-[440px] border-r border-border bg-card/30 flex flex-col">
            {/* Panel header */}
            <div className="shrink-0 px-5 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  {SIDEBAR_ITEMS.find((i) => i.id === activeSection)?.label || "Settings"}
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setResetOpen(true)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-7 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin scrollbar-thumb-white/10">
              <CustomizationPanel
                customization={customization}
                onChange={handleChange}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>
          </div>

          {/* ── Right Panel — Immersive Preview ── */}
          <div className="flex-1 flex flex-col min-w-0 bg-background">
            {/* Preview controls */}
            <div className="shrink-0 px-5 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-500">Live Preview</span>
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 border border-border">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`px-3 h-7 rounded-md text-xs font-medium transition-all ${
                    previewMode === "desktop"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 inline-block mr-1.5" />
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`px-3 h-7 rounded-md text-xs font-medium transition-all ${
                    previewMode === "mobile"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 inline-block mr-1.5" />
                  Phone
                </button>
              </div>
            </div>

            {/* Preview area */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
              <motion.div
                key={previewMode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`${
                  previewMode === "mobile"
                    ? "w-[380px] h-[700px] rounded-[32px]"
                    : "w-full h-full max-w-4xl rounded-2xl"
                } overflow-hidden relative`}
              >
                <LivePreview
                  customization={customization}
                  user={user}
                  links={links}
                  isMobile={previewMode === "mobile"}
                />
              </motion.div>
            </div>
          </div>
        </div>
      )}

      <ProfileEditModal key={user?.id || "guest"} open={profileOpen} onOpenChange={setProfileOpen} />
      <ActivityLogDialog open={activityLogOpen} onOpenChange={setActivityLogOpen} />
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset Customization"
        description="This will restore the default appearance."
        onConfirm={handleReset}
        confirmLabel="Reset"
      />
      <ConfirmDialog
        open={logoutConfirm}
        onOpenChange={setLogoutConfirm}
        title="Logout"
        description="Are you sure you want to logout?"
        onConfirm={() => { logout(); navigate("/"); }}
        confirmLabel="Logout"
      />
    </div>
  );
}

export default CustomizeProfilePage;
