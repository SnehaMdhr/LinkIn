import { useState, useRef, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, googleSignIn } from "../services/authServices";
import { AuthContext } from "../context/authContext";
import { useToast } from "../context/toastContext";
import { Button } from "../components/ui/button";
import { PasswordInput } from "../components/ui/passwordInput";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import ThemeDropdown from "../components/ThemeDropdown";
import TurnstileWidget from "../components/ui/TurnstileWidget";

function RegisterPage() {
  const [f, setF] = useState({ name: "", email: "", username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const { login } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();
  const gisInitialized = useRef(false);

  const handleGoogleCredential = useCallback(async (response) => {
    setLoading(true);
    setError("");
    try {
      const res = await googleSignIn(response.credential);
      const userData = res.user || res.data;
      const token = res.token;
      login(userData, token, true);
      toast.success(`Welcome, ${userData.name}!`);
      navigate(userData.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Google sign-in failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [login, navigate, toast]);

  useEffect(() => {
    const checkGoogle = setInterval(() => {
      if (window.google?.accounts?.id && !gisInitialized.current) {
        clearInterval(checkGoogle);
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          cancel_on_tap_outside: false,
        });
        gisInitialized.current = true;
      }
    }, 200);
    return () => clearInterval(checkGoogle);
  }, [handleGoogleCredential]);

  const handleGoogleClick = () => {
    if (!window.google?.accounts?.id) {
      const msg = "Google sign-in is loading. Please try again.";
      setError(msg); toast.error(msg);
      return;
    }
    try {
      window.google.accounts.id.prompt();
    } catch (e) {
      console.warn("Google prompt failed:", e);
      const msg = "Google sign-in encountered an issue. Please try again.";
      setError(msg); toast.error(msg);
    }
  };

  const h = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const s = async (e) => {
    e.preventDefault();
    setError("");

    if (!f.name.trim()) { const msg = "Name is required."; setError(msg); toast.error(msg); return; }
    if (!f.email.trim()) { const msg = "Email is required."; setError(msg); toast.error(msg); return; }
    if (!f.username.trim()) { const msg = "Username is required."; setError(msg); toast.error(msg); return; }
    if (!f.confirmPassword.trim()) { const msg = "Confirm password is required."; setError(msg); toast.error(msg); return; }
    if (f.password.length < 6) { const msg = "Password must be at least 6 characters."; setError(msg); toast.error(msg); return; }
    if (!/[A-Z]/.test(f.password)) { const msg = "Password must contain at least one uppercase letter."; setError(msg); toast.error(msg); return; }
    if (!/[a-z]/.test(f.password)) { const msg = "Password must contain at least one lowercase letter."; setError(msg); toast.error(msg); return; }
    if (!/[0-9]/.test(f.password)) { const msg = "Password must contain at least one number."; setError(msg); toast.error(msg); return; }
    if (!/[^A-Za-z0-9]/.test(f.password)) { const msg = "Password must contain at least one special character."; setError(msg); toast.error(msg); return; }
    if (f.password !== f.confirmPassword) { const msg = "Passwords do not match."; setError(msg); toast.error(msg); return; }
    if (!captchaToken) { const msg = "Please complete the CAPTCHA verification."; setError(msg); toast.error(msg); return; }

    setLoading(true);
    try {
      await registerUser({ ...f, captchaToken });
      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div className="absolute top-6 right-6">
        <ThemeDropdown />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create your LinkIn account</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2 mb-4">{error}</div>}
          <form onSubmit={s} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <input type="text" name="name" value={f.name} onChange={h}
                className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Sneha K" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input type="email" name="email" value={f.email} onChange={h}
                className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Username</label>
              <input type="text" name="username" value={f.username} onChange={h}
                className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="sneha" />
              <p className="text-xs text-muted-foreground mt-1">linkin.com/{f.username || "username"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <PasswordInput name="password" value={f.password} onChange={h} placeholder="••••••••" />
              <p className="text-xs text-muted-foreground mt-1">Min 6 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
              <PasswordInput name="confirmPassword" value={f.confirmPassword} onChange={h} placeholder="••••••••" />
            </div>
            <TurnstileWidget onVerify={setCaptchaToken} />
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full border border-input rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account? <Link to="/login" className="text-primary font-medium">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;