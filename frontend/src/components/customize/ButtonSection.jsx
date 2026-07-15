import { useState } from "react";
import { BUTTON_STYLES, BUTTON_WIDTHS, BUTTON_ANIMATIONS } from "../../config/customization";

const BUTTON_TEXT_PRESETS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
  { name: "Gray", value: "#6b7280" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
];

export default function ButtonSection({ customization, onChange }) {
  const { buttonStyle, buttonWidth, buttonAnimation, buttonTextColor } = customization;
  const [customBtnTextColor, setCustomBtnTextColor] = useState(buttonTextColor || "#000000");
  const isCustom = !BUTTON_TEXT_PRESETS.some((c) => c.value === buttonTextColor);

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-foreground">Buttons</h3>

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Button Style</label>
        <div className="grid grid-cols-3 gap-2">
          {BUTTON_STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => onChange("buttonStyle", s.value)}
              className={`px-2 py-2 text-[11px] font-medium rounded-lg border transition-all ${
                buttonStyle === s.value
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/20"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Button Width</label>
        <div className="flex gap-2">
          {BUTTON_WIDTHS.map((w) => (
            <button
              key={w.value}
              onClick={() => onChange("buttonWidth", w.value)}
              className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                buttonWidth === w.value
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/20"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Hover Animation</label>
        <div className="flex gap-2">
          {BUTTON_ANIMATIONS.map((a) => (
            <button
              key={a.value}
              onClick={() => onChange("buttonAnimation", a.value)}
              className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                buttonAnimation === a.value
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/20"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground block">Button Text & Icon Color</label>
        <div className="flex flex-wrap gap-1.5">
          {BUTTON_TEXT_PRESETS.map((c) => (
            <button
              key={c.value}
              title={c.name}
              onClick={() => {
                onChange("buttonTextColor", c.value);
                setCustomBtnTextColor(c.value);
              }}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                buttonTextColor === c.value && !isCustom
                  ? "border-foreground scale-110 ring-2 ring-foreground/20"
                  : "border-border hover:scale-105"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <label
              htmlFor="btn-text-color-picker"
              className="w-7 h-7 rounded-full border-2 border-dashed border-border hover:border-foreground/30 transition-all cursor-pointer flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: customBtnTextColor }}
              title="Custom color"
            >
              {!isCustom && (
                <span className="text-[9px] text-muted-foreground">+</span>
              )}
            </label>
            <input
              id="btn-text-color-picker"
              type="color"
              value={customBtnTextColor}
              onChange={(e) => {
                setCustomBtnTextColor(e.target.value);
                onChange("buttonTextColor", e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-7 h-7"
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {isCustom ? buttonTextColor : "Pick any color"}
          </span>
        </div>
      </div>
    </div>
  );
}
