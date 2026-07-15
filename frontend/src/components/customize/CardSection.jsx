import { useState } from "react";
import { BLUR_AMOUNTS, BORDER_WIDTHS, CARD_BORDER_COLORS } from "../../config/customization";

export default function CardSection({ customization, onChange }) {
  const { cardOpacity, cardBlur, cardBorderColor, cardBorderWidth } = customization;
  const [customBorderColor, setCustomBorderColor] = useState(cardBorderColor || "#ffffff");

  const isCustomBorderColor = !CARD_BORDER_COLORS.some((c) => c.value === cardBorderColor);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Card</h3>

      {/* Opacity */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">
          Opacity — {cardOpacity}%
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={20}
          value={cardOpacity}
          onChange={(e) => onChange("cardOpacity", Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none bg-border cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Blur */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Blur</label>
        <div className="flex gap-2">
          {BLUR_AMOUNTS.map((b) => (
            <button
              key={b.value}
              onClick={() => onChange("cardBlur", b.value)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                cardBlur === b.value
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/20"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Border Color */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground block">Border Color</label>
        <div className="flex flex-wrap gap-1.5">
          {CARD_BORDER_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.name}
              onClick={() => {
                onChange("cardBorderColor", c.value);
                setCustomBorderColor(c.value);
              }}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                cardBorderColor === c.value && !isCustomBorderColor
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
              htmlFor="card-border-color-picker"
              className="w-7 h-7 rounded-full border-2 border-dashed border-border hover:border-foreground/30 transition-all cursor-pointer flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: customBorderColor }}
              title="Custom color"
            >
              {!isCustomBorderColor && (
                <span className="text-[9px] text-muted-foreground">+</span>
              )}
            </label>
            <input
              id="card-border-color-picker"
              type="color"
              value={customBorderColor}
              onChange={(e) => {
                setCustomBorderColor(e.target.value);
                onChange("cardBorderColor", e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-7 h-7"
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {isCustomBorderColor ? cardBorderColor : "Pick any color"}
          </span>
        </div>
      </div>

      {/* Border Width */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Border Width</label>
        <div className="flex gap-2">
          {BORDER_WIDTHS.map((w) => (
            <button
              key={w.value}
              onClick={() => onChange("cardBorderWidth", w.value)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                cardBorderWidth === w.value
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/20"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
