import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import ConfirmDialog from "../components/ConfirmDialog";
import { Button } from "../components/ui/button";

function CustomizeProfilePage() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const [customization, setCustomization] = useState(DEFAULT_CUSTOMIZATION);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [custData, linksData] = await Promise.all([
        getCustomization(user.id).catch(() => DEFAULT_CUSTOMIZATION),
        getLinks(user.id).catch(() => []),
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
      const response = await updateCustomization(user.id, customization);
      if (response.user) {
        login({ ...user, ...response.user });
      }
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to save customization.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await resetCustomization(user.id);
      setCustomization(DEFAULT_CUSTOMIZATION);
      if (response.user) {
        login({ ...user, ...response.user });
      }
      toast.success("Restored default appearance.");
    } catch {
      toast.error("Failed to reset customization.");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Dashboard
          </button>
          <h1 className="text-lg font-bold text-foreground">Customize Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row">
          {/* Customization Panel */}
          <div className="w-full lg:w-[400px] lg:h-[calc(100vh-65px)] lg:overflow-y-auto border-r border-border p-6">
            <CustomizationPanel customization={customization} onChange={handleChange} />
          </div>

          {/* Live Preview */}
          <div className="flex-1 p-6 lg:h-[calc(100vh-65px)] lg:overflow-y-auto bg-muted/30">
            <p className="text-xs text-muted-foreground mb-3 text-center">Public Profile Preview</p>
            <div className="max-w-md mx-auto">
              <LivePreview customization={customization} user={user} links={links} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile save button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset Customization"
        description="This will restore the default appearance."
        onConfirm={handleReset}
        confirmLabel="Reset"
      />
    </div>
  );
}

export default CustomizeProfilePage;
