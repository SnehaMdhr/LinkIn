import { useState, useEffect, useRef } from "react";
import { getUserDetails, updateUser } from "../services/adminServices";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

export default function EditUserModal({ open, onOpenChange, userId, onUserUpdated }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    role: "user",
    status: "active",
    profileImage: "",
  });
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open && userId) {
      setFetching(true);
      setError("");
      getUserDetails(userId)
        .then((data) => {
          const u = data.user;
          setFormData({
            name: u.name || "",
            email: u.email || "",
            username: u.username || "",
            role: u.role || "user",
            status: u.status || "active",
            profileImage: u.profileImage || "",
          });
          setPreview(u.profileImage || "");
        })
        .catch(() => setError("Failed to load user data."))
        .finally(() => setFetching(false));
    }
  }, [open, userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === "string") {
        setPreview(dataUrl);
        setFormData((prev) => ({ ...prev, profileImage: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await updateUser(userId, formData);
      onOpenChange(false);
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information and settings.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">
            {error}
          </div>
        )}

        {fetching ? (
          <p className="text-muted-foreground text-sm py-4">Loading user data...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {formData.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Choose Image
                  </Button>
                  {preview && (
                    <Button type="button" variant="ghost" size="sm" className="text-destructive ml-2"
                      onClick={() => { setPreview(""); setFormData((prev) => ({ ...prev, profileImage: "" })); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input id="edit-username" name="username" value={formData.username} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
