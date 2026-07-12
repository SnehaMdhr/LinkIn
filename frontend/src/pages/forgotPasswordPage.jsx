import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authServices";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import ThemeDropdown from "../components/ThemeDropdown";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
      if (data.resetUrl) {
        setMessage((prev) => `${prev}\n\nDev note: ${data.resetUrl}`);
      }
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
          <CardTitle className="text-center text-2xl">Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2 mb-4">{error}</div>
          )}
          {message && (
            <div className="bg-primary/10 text-primary text-sm rounded-md px-4 py-2 mb-4 whitespace-pre-line">{message}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com" />
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Remember your password? <Link to="/login" className="text-primary font-medium">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;
