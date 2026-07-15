import { useState } from "react";
import { ACCENT_COLORS } from "../../config/customization";

export default function AccentSection({ customization, onChange }) {
  const { accentColor } = customization;
  const [customColor, setCustomColor] = useState(accentColor);

  const isCustom = !ACCENT_COLORS.some((c) => c.value === accentColor);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Accent Color</h3>
      <p className="text-[11px] text-muted-foreground/60">Applied to buttons, icons, and active elements.</p>

      <div className="grid grid-cols-6 gap-2">
        {ACCENT_COLORS.map((c) => (
          <button
            key={c.value}
            title={c.name}
            onClick={() => {
              onChange("accentColor", c.value);
              setCustomColor(c.value);
            }}
            className={`w-full aspect-square rounded-full border-2 transition-all ${
              accentColor === c.value && !isCustom
                ? "border-foreground scale-110 ring-2 ring-foreground/20"
                : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <label
            htmlFor="accent-color-picker"
            className="w-9 h-9 rounded-full border-2 border-dashed border-border hover:border-foreground/30 transition-all cursor-pointer flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: customColor }}
            title="Custom color"
          >
            {!isCustom && (
              <span className="text-[10px] text-muted-foreground">+</span>
            )}
          </label>
          <input
            id="accent-color-picker"
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              onChange("accentColor", e.target.value);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-9 h-9"
          />
        </div>
        <div>
          <span className="text-xs text-foreground font-medium block">
            {isCustom ? accentColor.toUpperCase() : "Custom Color"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {isCustom ? "Your custom color" : "Click to pick any color"}
          </span>
        </div>
      </div>
    </div>
  );
}
