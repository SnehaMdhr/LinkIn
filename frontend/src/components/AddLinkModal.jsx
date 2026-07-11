import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { createLink } from "../services/linkServices";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import PlatformIcon from "./PlatformIcon";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

const PLATFORM_OPTIONS = [
  "GitHub", "LinkedIn", "Instagram", "Facebook",
  "TikTok", "YouTube", "Portfolio", "Website", "Other",
];

export default function AddLinkModal({ open, onOpenChange, onLinkAdded }) {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    platform: "GitHub",
    title: "",
    url: "",
    position: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* Reset form whenever the modal opens */
  useEffect(() => {
    if (open) {
      setFormData({ platform: "GitHub", title: "", url: "", position: 0 });
      setError("");
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createLink({ ...formData, userId: user.id });
      onOpenChange(false);
      if (onLinkAdded) onLinkAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a New Link</DialogTitle>
          <DialogDescription>
            Add a social profile, portfolio, or any link you want to share.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Platform</Label>
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

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="My GitHub Profile"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://github.com/yourname"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position (display order)</Label>
            <Input
              id="position"
              name="position"
              type="number"
              min="0"
              value={formData.position}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adding..." : "Add Link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
