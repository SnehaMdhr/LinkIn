import { ENTRANCE_ANIMATIONS } from "../../config/customization";

export default function AnimationSection({ customization, onChange }) {
  const { animation } = customization;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Entrance Animation</h3>
      <p className="text-[11px] text-muted-foreground/60">Applied once when the profile loads.</p>
      <div className="flex gap-2">
        {ENTRANCE_ANIMATIONS.map((a) => (
          <button
            key={a.value}
            onClick={() => onChange("animation", a.value)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
              animation === a.value
                ? "bg-primary/10 border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:border-foreground/20"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
