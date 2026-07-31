import { useState, useEffect } from "react";
import {
  setupMfa,
  verifyMfaSetup,
  disableMfa,
  getMfaStatus,
} from "../services/authServices";
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

function MfaSetupDialog({ open, onOpenChange }) {
  const [step, setStep] = useState("loading"); // loading | enabled | setup | verify | disable
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) loadStatus();
  }, [open]);

  const loadStatus = async () => {
    setStep("loading");
    setError("");
    try {
      const status = await getMfaStatus();
      if (status.mfaEnabled) {
        setStep("enabled");
      } else {
        setStep("setup");
      }
    } catch {
      setStep("setup");
    }
  };

  const handleSetup = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await setupMfa();
      setQrCode(res.qrCode);
      setSecret(res.secret);
      setStep("verify");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to setup MFA.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!token.trim() || token.length < 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await verifyMfaSetup(token.trim());
      toast.success("MFA has been enabled successfully!");
      setStep("enabled");
      setToken("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Password is required to disable MFA");
      return;
    }

    setLoading(true);
    try {
      await disableMfa({ password });
      toast.success("MFA has been disabled.");
      setStep("setup");
      setPassword("");
      setQrCode("");
      setSecret("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to disable MFA.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setToken("");
    setPassword("");
    setError("");
    setStep("loading");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication (MFA)</DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account using an authenticator app.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md px-4 py-2">
            {error}
          </div>
        )}

        {step === "loading" && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {step === "enabled" && (
          <div className="space-y-4">
            <div className="bg-primary/10 text-primary text-sm rounded-md px-4 py-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>MFA is currently <strong>enabled</strong> on your account.</span>
            </div>

            <div className="border border-border rounded-md p-4 space-y-3">
              <Label htmlFor="disable-password">Enter your password to disable MFA</Label>
              <div className="relative">
                <Input
                  id="disable-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <Button
                variant="destructive"
                onClick={handleDisable}
                disabled={loading || !password.trim()}
                className="w-full"
              >
                {loading ? "Disabling..." : "Disable MFA"}
              </Button>
            </div>
          </div>
        )}

        {step === "setup" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              MFA is currently disabled. When enabled, you&apos;ll need to enter a code from your
              authenticator app each time you log in.
            </p>
            <Button onClick={handleSetup} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Setup MFA"}
            </Button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.),
              then enter the 6-digit code below to verify.
            </p>

            {qrCode && (
              <div className="flex justify-center">
                <img
                  src={qrCode}
                  alt="MFA QR Code"
                  className="w-48 h-48 border border-border rounded-md"
                />
              </div>
            )}

            {secret && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Or enter this key manually:
                </p>
                <code className="bg-muted px-3 py-1.5 rounded text-sm font-mono select-all">
                  {secret.match(/.{1,4}/g)?.join(" ") || secret}
                </code>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="verify-token">Verification Code</Label>
                <Input
                  id="verify-token"
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
              <Button
                type="submit"
                disabled={loading || token.length !== 6}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default MfaSetupDialog;
