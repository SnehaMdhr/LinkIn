import { QR_POSITIONS } from "../../config/customization";

export default function VisibilitySection({ customization, onChange }) {
  const { showBio, showIcons, showQr, showProfilePicture, qrPosition } = customization;

  const toggles = [
    { label: "Profile Picture", key: "showProfilePicture", value: showProfilePicture },
    { label: "Bio", key: "showBio", value: showBio },
    { label: "QR Code", key: "showQr", value: showQr },
    { label: "Social Icons", key: "showIcons", value: showIcons },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Visibility</h3>

      <div className="space-y-2">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between">
            <span className="text-xs text-foreground">{t.label}</span>
            <button
              role="switch"
              aria-checked={t.value}
              onClick={() => onChange(t.key, !t.value)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                t.value ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  t.value ? "translate-x-4" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {showQr && (
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">QR Code Position</label>
          <div className="flex gap-2">
            {QR_POSITIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => onChange("qrPosition", p.value)}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  qrPosition === p.value
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-muted-foreground hover:border-foreground/20"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
