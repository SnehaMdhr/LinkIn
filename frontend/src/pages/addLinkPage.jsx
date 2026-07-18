import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { useToast } from "../context/toastContext";
import { createLink } from "../services/linkServices";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import PlatformIcon from "../components/PlatformIcon";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";

const PLATFORM_OPTIONS = [
  "GitHub", "LinkedIn", "Instagram", "Facebook",
  "TikTok", "YouTube", "Portfolio", "Website", "Other",
];

function AddLinkPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    platform: "GitHub",
    title: "",
    url: "",
    position: 0,
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
    setLoading(true);

    try {
      await createLink(formData);
      toast.success("Link added successfully!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add link. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add a New Link</CardTitle>
        </CardHeader>
        <CardContent>

        {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Platform</label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      <span className="flex items-center gap-2">
                        <PlatformIcon platform={p} className="w-4 h-4" />
                        {p}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange}
              className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="My GitHub Profile" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">URL</label>
            <input type="text" name="url" value={formData.url} onChange={handleChange}
              className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://github.com/yourname" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Position (display order)</label>
            <input type="number" name="position" value={formData.position} onChange={handleChange}
              className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" min="0" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1" size="lg">
              {loading ? "Adding..." : "Add Link"}
            </Button>
            <Button variant="outline" className="flex-1" size="lg" asChild>
              <Link to="/dashboard">Cancel</Link>
            </Button>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddLinkPage;