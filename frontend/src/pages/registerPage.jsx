import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authServices";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import ThemeDropdown from "../components/ThemeDropdown";

function RegisterPage() {
  const [f, setF] = useState({ name: "", email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const h = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const s = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(f);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
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