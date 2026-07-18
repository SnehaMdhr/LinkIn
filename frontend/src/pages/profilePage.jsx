import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { useToast } from "../context/toastContext";
import api from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";

const THEME_OPTIONS = ["light", "dark", "colorful", "minimal"];

function ProfilePage() {
  const { user, loading: authLoading, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    profileImage: user?.profileImage || "",
    theme: user?.theme || "light",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.put("/profile", formData);
      // Update context + localStorage with fresh data
      login({ ...user, ...response.data.user });
      toast.success("Profile updated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2 mb-4">{error}</div>
        )}
        

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3"
              className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tell people a bit about yourself..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Profile Image URL</label>
            <input type="text" name="profileImage" value={formData.profileImage} onChange={handleChange}
              className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://example.com/your-photo.jpg" />
            <p className="text-xs text-muted-foreground mt-1">
              Basic implementation: paste an image URL (file upload comes later).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Theme</label>
            <Select
              value={formData.theme}
              onValueChange={(value) => setFormData({ ...formData, theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1" size="lg">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" className="flex-1" size="lg" asChild>
              <Link to="/dashboard">Back</Link>
            </Button>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;