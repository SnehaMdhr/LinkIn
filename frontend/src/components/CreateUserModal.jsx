import { useState, useEffect, useRef } from "react";
import { useToast } from "../context/toastContext";
import { createUser } from "../services/adminServices";
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

export default function CreateUserModal({ open, onOpenChange, onUserCreated }) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "user",
    status: "active",
    profileImage: "",
  });
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({ name: "", email: "", username: "", password: "", role: "user", status: "active", profileImage: "" });
      setPreview("");
      setError("");
    }
  }, [open]);

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
      await createUser(formData);
      toast.success("User created successfully!");
      onOpenChange(false);
      if (onUserCreated) onUserCreated();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create user.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Add a new user to the platform.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">U</span>
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
            <Label htmlFor="create-name">Name</Label>
            <Input id="create-name" name="name" value={formData.name} onChange={handleChange} placeholder="Full name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email">Email</Label>
            <Input id="create-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="user@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-username">Username</Label>
            <Input id="create-username" name="username" value={formData.username} onChange={handleChange} placeholder="username" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-password">Password</Label>
            <Input id="create-password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
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
              {loading ? "Creating..." : "Create"}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
