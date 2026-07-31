import { useState, useRef, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { useToast } from "../context/toastContext";
import api from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import MfaSetupDialog from "./MfaSetupDialog";
import ChangePasswordModal from "./ChangePasswordModal";

export default function ProfileEditModal({ open, onOpenChange }) {
  const { user, login } = useContext(AuthContext);
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    profileImage: user?.profileImage || "",
  });
  const [preview, setPreview] = useState(user?.profileImage || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    console.log("🔥 ProfileEditModal handleFileSelect FIRED");
    const file = e.target.files?.[0];
    console.log("🔥 Selected file:", file?.name, "type:", file?.type, "size:", file?.size);
    if (!file) return;

    // Validate file type on client side before anything else
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    console.log("🔥 Checking file.type against:", allowedTypes, "→ match:", allowedTypes.includes(file.type));
    if (!allowedTypes.includes(file.type)) {
      const errMsg = "Only JPEG, PNG, and WebP images are allowed.";
      console.log("🔥 REJECTED - ", errMsg);
      setError(errMsg);
      toast.error(errMsg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file size on client side (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      const errMsg = "File too large. Max size is 2MB.";
      console.log("🔥 REJECTED - ", errMsg);
      setError(errMsg);
      toast.error(errMsg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    console.log("🔥 FILE ACCEPTED - setting selectedFile");
    // Store the actual File object for multipart upload
    setSelectedFile(file);

    // Show a local preview using base64
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === "string") {
        setPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) { setError("Name is required."); return; }

    setLoading(true);

    try {
      let response;

      if (selectedFile) {
        // Use FormData for file upload → triggers multer fileFilter on backend
        const form = new FormData();
        form.append("profileImage", selectedFile);
        form.append("name", formData.name.trim());
        form.append("bio", formData.bio);

        // Axios auto-detects FormData and sets multipart/form-data + boundary
        response = await api.put("/profile", form);
      } else {
        // No file selected → send regular JSON (only name + bio)
        const payload = { name: formData.name.trim(), bio: formData.bio };
        if (formData.profileImage === "") payload.profileImage = "";
        response = await api.put("/profile", payload);
      }

      login({ ...user, ...response.data.user });
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Tell people a bit about yourself..."
            />
          </div>

          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Image
                </Button>
                {preview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive ml-2"
                    onClick={() => {
                      setPreview("");
                      setSelectedFile(null);
                      setFormData((prev) => ({ ...prev, profileImage: "" }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a JPG or PNG file.
                </p>
              </div>
            </div>
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

        {/* Security Section */}
        <div className="border-t border-border pt-5 mt-5">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h3 className="text-sm font-semibold text-foreground">Security</h3>
          </div>
          <div className="bg-muted/40 border border-border rounded-lg p-3 space-y-2">
            <button
              type="button"
              onClick={() => setMfaSetupOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-background transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
            </button>
            <div className="border-t border-border/50" />
            <button
              type="button"
              onClick={() => setChangePasswordOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-background transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
            </button>
          </div>
        </div>
      </DialogContent>

      <MfaSetupDialog open={mfaSetupOpen} onOpenChange={setMfaSetupOpen} />
      <ChangePasswordModal open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </Dialog>
  );
}
