import { Turnstile } from "@marsidev/react-turnstile";

const SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY ||
  "1x00000000000000000000AA"; // Cloudflare test key — always passes

function TurnstileWidget({ onVerify }) {
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
