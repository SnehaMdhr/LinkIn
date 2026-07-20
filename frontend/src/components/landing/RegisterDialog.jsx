import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, googleSignIn } from "../../services/authServices";
import { AuthContext } from "../../context/authContext";
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
import TurnstileWidget from "../ui/TurnstileWidget";

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
  const [captchaToken, setCaptchaToken] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const googleBtnRef = useRef(null);
  const gisInitialized = useRef(false);

  // Initialize GIS and show popup on button click
  const handleGoogleClick = () => {
    if (!window.google) {
      setError("Google sign-in is loading. Please try again.");
      return;
    }
    if (!gisInitialized.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      gisInitialized.current = true;
    }
    window.google.accounts.id.prompt();
  };

  const handleGoogleCredential = async (response) => {
    setLoading(true);
    setError("");
    try {
      const res = await googleSignIn(response.credential);
      const userData = res.user || res.data;
      const token = res.token;
      login(userData, token, true);
      toast.success(`Welcome, ${userData.name}!`);
      onOpenChange(false);
      navigate(userData.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Google sign-in failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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

    if (!captchaToken) { setError("Please complete the CAPTCHA verification."); return; }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ ...formData, captchaToken });
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
      setCaptchaToken(null);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
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
          <TurnstileWidget onVerify={setCaptchaToken} />

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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            ref={googleBtnRef}
            onClick={handleGoogleClick}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full border border-input rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            Continue with Google
          </button>
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
