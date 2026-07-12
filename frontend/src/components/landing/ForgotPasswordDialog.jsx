import { useState } from "react";
import { forgotPassword } from "../../services/authServices";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

export default function ForgotPasswordDialog({ open, onOpenChange, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (val) => {
    if (!val) {
      setEmail("");
      setMessage("");
      setResetUrl("");
      setError("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            Enter your email and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-primary/10 text-primary text-sm rounded-md px-4 py-2">
            {message}
            {resetUrl && (
              <p className="mt-2 text-xs text-primary/70 break-all">{resetUrl}</p>
            )}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {message && (
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              Close
            </Button>
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          Remember your password?{" "}
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
