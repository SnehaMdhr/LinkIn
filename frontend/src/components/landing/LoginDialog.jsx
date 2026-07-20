import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, googleSignIn } from "../../services/authServices";
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

function LoginDialog({ open, onOpenChange, onSwitchToRegister, onSwitchToForgotPassword }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [rateLimitReset, setRateLimitReset] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();
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
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "338475030074-agovv9ehou4uicr1ji4r0an87g0v8g8d.apps.googleusercontent.com",
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

    if (!formData.email.trim()) { setError("Email is required."); return; }
    if (!formData.password) { setError("Password is required."); return; }

    setLoading(true);
    try {
      const res = await loginUser(formData);
      const userData = res.user || res.data;
      const token = res.token;
      login(userData, token, rememberMe);
      toast.success(`Welcome back, ${userData.name}!`);
      onOpenChange(false);
      navigate(userData.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        const resetTime = err.response?.data?.resetTime;
        setRateLimitReset(resetTime);
        setError("");
      } else {
        const msg = err.response?.data?.message || "Invalid email or password.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRateLimitExpire = () => {
    setRateLimitReset(null);
    setError("");
  };

  const handleOpenChange = (val) => {
    if (!val) {
      setFormData({ email: "", password: "" });
      setRememberMe(true);
      setError("");
      setRateLimitReset(null);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login to LinkIn</DialogTitle>
          <DialogDescription>
            Welcome back! Sign in to manage your links.
          </DialogDescription>
        </DialogHeader>

        {rateLimitReset ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md px-4 py-3">
            <RateLimitCountdown resetTime={rateLimitReset} onExpire={handleRateLimitExpire} />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <PasswordInput
              id="login-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-primary hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Logging in..." : "Login"}
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
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary font-medium hover:underline"
          >
            Register
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default LoginDialog;
