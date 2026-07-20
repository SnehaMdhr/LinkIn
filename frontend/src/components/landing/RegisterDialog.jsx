import { useState } from "react";
import { registerUser } from "../../services/authServices";
import { useToast } from "../../context/toastContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/passwordInput";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import RateLimitCountdown from "../RateLimitCountdown";

function RegisterDialog({ open, onOpenChange, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [rateLimitReset, setRateLimitReset] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRateLimitReset(null);

    // Client-side validation for all fields
    const { name, email, username, password, confirmPassword } = formData;
    if (!name.trim() || !email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!/[A-Z]/.test(password)) { setError("Password must contain at least one uppercase letter."); return; }
    if (!/[a-z]/.test(password)) { setError("Password must contain at least one lowercase letter."); return; }
    if (!/[0-9]/.test(password)) { setError("Password must contain at least one number."); return; }
    if (!/[^A-Za-z0-9]/.test(password)) { setError("Password must contain at least one special character."); return; }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerUser(formData);
      toast.success("Account created successfully! Please log in.");
      onOpenChange(false);
      onSwitchToLogin();
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        const resetTime = err.response?.data?.resetTime;
        setRateLimitReset(resetTime);
        setError("");
      } else {
        const msg = err.response?.data?.message || "Something went wrong.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (val) => {
    if (!val) {
      setFormData({ name: "", email: "", username: "", password: "", confirmPassword: "" });
      setError("");
      setRateLimitReset(null);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create your LinkIn account</DialogTitle>
          <DialogDescription>
            Get started for free. No credit card required.
          </DialogDescription>
        </DialogHeader>

        {rateLimitReset ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md px-4 py-3">
            <RateLimitCountdown resetTime={rateLimitReset} onExpire={() => { setRateLimitReset(null); setError(""); }} />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-name">Full Name</Label>
            <Input
              id="reg-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your Email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-username">Username</Label>
            <Input
              id="reg-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your Username"
            />
            <p className="text-xs text-muted-foreground">
              linkin.com/{formData.username || "username"}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <PasswordInput
              id="reg-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your Password"
            />
            <p className="text-xs text-muted-foreground">Min 6 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-confirm-password">Confirm Password</Label>
            <PasswordInput
              id="reg-confirm-password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your Password"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Registering..." : "Register"}
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

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary font-medium hover:underline"
          >
            Login
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default RegisterDialog;
