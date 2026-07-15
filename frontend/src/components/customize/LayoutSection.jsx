import { LAYOUTS, AVATAR_SHAPES, LINK_ALIGNMENTS } from "../../config/customization";

export default function LayoutSection({ customization, onChange }) {
  const { layout, avatarShape, linkAlignment } = customization;

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-foreground">Layout</h3>

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Profile Layout</label>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l.value}
              onClick={() => onChange("layout", l.value)}
              className={`p-3 rounded-lg border text-center transition-all ${
                layout === l.value
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/20"
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-1.5 rounded bg-border/50 flex items-center justify-center">
                {l.value === "classic" && (
                  <div className="space-y-1">
                    <div className="w-4 h-4 rounded-full bg-current/20 mx-auto" />
                    <div className="w-6 h-1 rounded bg-current/20 mx-auto" />
                  </div>
                )}
                {l.value === "side-by-side" && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-current/20" />
                    <div className="w-3 h-1 rounded bg-current/20" />
                  </div>
                )}
                {l.value === "banner" && (
                  <div className="space-y-1">
                    <div className="w-8 h-1.5 rounded bg-current/20" />
                    <div className="w-3 h-3 rounded-full bg-current/20 mx-auto" />
                  </div>
                )}
              </div>
              <span className="text-[11px] font-medium">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Avatar Shape</label>
        <div className="flex gap-2">
          {AVATAR_SHAPES.map((s) => (
            <button
              key={s.value}
              onClick={() => onChange("avatarShape", s.value)}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                avatarShape === s.value
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/20"
              }`}
            >
              <div className={`w-6 h-6 mx-auto mb-1 bg-primary/30 ${
                s.value === "circle" ? "rounded-full" : s.value === "rounded" ? "rounded-lg" : "rounded-none"
              }`} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Link Alignment</label>
        <div className="flex gap-2">
          {LINK_ALIGNMENTS.map((a) => (
            <button
              key={a.value}
              onClick={() => onChange("linkAlignment", a.value)}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                linkAlignment === a.value
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/20"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
