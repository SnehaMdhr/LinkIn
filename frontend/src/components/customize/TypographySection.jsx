import { FONTS } from "../../config/customization";
import { loadFont, getFontFamily } from "../../utils/fonts";

export default function TypographySection({ customization, onChange }) {
  const { font } = customization;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Typography</h3>
      <div className="space-y-2">
        {FONTS.map((f) => {
          loadFont(f);
          return (
            <button
              key={f}
              onClick={() => onChange("font", f)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                font === f
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-foreground hover:border-foreground/20"
              }`}
              style={{ fontFamily: getFontFamily(f) }}
            >
              <span className="text-sm font-semibold">{f}</span>
              <span className="block text-[11px] text-muted-foreground/60 mt-0.5">The quick brown fox</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
