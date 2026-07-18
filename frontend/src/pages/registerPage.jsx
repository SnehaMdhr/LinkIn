import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authServices";
import { useToast } from "../context/toastContext";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import ThemeDropdown from "../components/ThemeDropdown";

function RegisterPage() {
  const [f, setF] = useState({ name: "", email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const h = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const s = async (e) => {
    e.preventDefault();
    setError("");

    if (!f.name.trim()) { setError("Name is required."); return; }
    if (!f.email.trim()) { setError("Email is required."); return; }
    if (!f.username.trim()) { setError("Username is required."); return; }
    if (f.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!/[A-Z]/.test(f.password)) { setError("Password must contain at least one uppercase letter."); return; }
    if (!/[a-z]/.test(f.password)) { setError("Password must contain at least one lowercase letter."); return; }
    if (!/[0-9]/.test(f.password)) { setError("Password must contain at least one number."); return; }
    if (!/[^A-Za-z0-9]/.test(f.password)) { setError("Password must contain at least one special character."); return; }

    setLoading(true);
    try {
      await registerUser(f);
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
              <input type="password" name="password" value={f.password} onChange={h}
                className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••" />
              <p className="text-xs text-muted-foreground mt-1">Min 6 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.</p>
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account? <Link to="/login" className="text-primary font-medium">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;