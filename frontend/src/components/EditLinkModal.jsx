import { useState, useEffect } from "react";
import api from "../services/api";
import { updateLink } from "../services/linkServices";
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

export default function EditLinkModal({ open, onOpenChange, linkId, onLinkUpdated }) {
  const [formData, setFormData] = useState({
    platform: "GitHub",
    title: "",
    url: "",
    position: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open && linkId) {
      setFormData({ platform: "GitHub", title: "", url: "", position: 0 });
      setError("");
      setFetching(true);

      api.get(`/links/single/${linkId}`)
        .then((res) => {
          setFormData({
            platform: res.data.platform,
            title: res.data.title,
            url: res.data.url,
            position: res.data.position,
          });
        })
        .catch(() => {
          setError("Could not load link details.");
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [open, linkId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await updateLink(linkId, formData);
      onOpenChange(false);
      if (onLinkUpdated) onLinkUpdated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>
            Update your link details and position.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">
            {error}
          </div>
        )}

        {fetching ? (
          <p className="text-sm text-muted-foreground py-4">Loading link...</p>
        ) : (
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
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="My GitHub Profile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://github.com/yourname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-position">Position (display order)</Label>
              <Input
                id="edit-position"
                name="position"
                type="number"
                min="0"
                value={formData.position}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save Changes"}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
