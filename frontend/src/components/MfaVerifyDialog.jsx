import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { verifyMfaLogin } from "../services/authServices";
import { AuthContext } from "../context/authContext";
import { useToast } from "../context/toastContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

function MfaVerifyDialog({ open, onOpenChange, userId, userName, rememberMe }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token.trim() || token.length < 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyMfaLogin(userId, token.trim(), rememberMe);
      const userData = res.user || res.data;
      login(userData, res.token, rememberMe);
      toast.success(`Welcome back, ${userData.name}!`);
      onOpenChange(false);
      navigate(userData.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid verification code. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setToken("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app to complete login.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-token">Authentication Code</Label>
            <Input
              id="mfa-token"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || token.length !== 6} className="flex-1">
              {loading ? "Verifying..." : "Verify"}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Open your authenticator app (Google Authenticator, Authy, etc.) and enter the code shown.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default MfaVerifyDialog;
