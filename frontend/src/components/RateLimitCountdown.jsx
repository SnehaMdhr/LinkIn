import { useState, useEffect, useRef } from "react";

/**
 * Real-time countdown timer for rate-limit cooldown.
 * Ticks down every second and auto-clears when it reaches zero.
 */
export default function RateLimitCountdown({ resetTime, onExpire }) {
  const [display, setDisplay] = useState("");
  const [progress, setProgress] = useState(100);
  const [totalMs, setTotalMs] = useState(0);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!resetTime) return;

    const end = new Date(resetTime).getTime();
    const initialMs = Math.max(0, end - Date.now());
    setTotalMs(initialMs);

    const tick = () => {
      const now = Date.now();
      const msLeft = Math.max(0, end - now);

      if (msLeft <= 0) {
        setDisplay("0s");
        setProgress(0);
        onExpireRef.current?.();
        return;
      }

      // Format as mm:ss
      const totalSec = Math.ceil(msLeft / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      setDisplay(m > 0 ? `${m}m ${s}s` : `${s}s`);

      // Progress percentage
      setProgress(Math.round((msLeft / initialMs) * 100));
    };

    tick(); // Immediate first render
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [resetTime]);

  if (!resetTime) return null;

  const circumference = 2 * Math.PI * 36; // r=36
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      {/* Circular progress ring */}
      <div className="relative w-16 h-16 shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 80 80">
          {/* Background ring */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-destructive/20"
          />
          {/* Progress ring */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-destructive transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-destructive">
          {display?.includes("m") ? display.split("m")[0] : display?.replace("s", "")}
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-destructive">Too many attempts</p>
        <p className="text-xs text-muted-foreground">
          Try again in <span className="font-mono font-bold text-destructive">{display}</span>
        </p>
      </div>
    </div>
  );
}
