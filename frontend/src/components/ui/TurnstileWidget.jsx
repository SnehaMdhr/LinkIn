import { useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

function TurnstileWidget({ onVerify }) {
  useEffect(() => {
    if (!SITE_KEY) {
      onVerify("bypassed-for-pentesting");
    }
  }, [onVerify]);

  if (!SITE_KEY) {
    return (
      <div className="flex justify-center">
        <p className="text-xs text-muted-foreground">Captcha bypassed for testing</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Turnstile
        siteKey={SITE_KEY}
        onSuccess={onVerify}
        options={{
          theme: "light",
        }}
      />
    </div>
  );
}

export default TurnstileWidget;
