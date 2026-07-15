import { useState } from "react";
import { BACKGROUND_TYPES, SOLID_COLORS, GRADIENTS } from "../../config/customization";

export default function AppearanceSection({ customization, onChange }) {
  const { backgroundType, backgroundColor, backgroundGradient, backgroundImage, customGradientFrom, customGradientTo } = customization;
  const [customSolidColor, setCustomSolidColor] = useState(backgroundColor);

  const isCustomSolid = !SOLID_COLORS.some((c) => c.value === backgroundColor);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onChange("backgroundImage", ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Background</h3>

      <div className="flex gap-2">
        {BACKGROUND_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange("backgroundType", t.value)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
              backgroundType === t.value
                ? "bg-primary/10 border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:border-foreground/20"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SOLID COLOR */}
      {backgroundType === "solid" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {SOLID_COLORS.map((c) => (
              <button
                key={c.value}
                title={c.name}
                onClick={() => {
                  onChange("backgroundColor", c.value);
                  setCustomSolidColor(c.value);
                }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  backgroundColor === c.value && !isCustomSolid
                    ? "border-primary scale-110 ring-2 ring-primary/30"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="solid-color-picker"
              className="w-8 h-8 rounded-full border-2 border-dashed border-border hover:border-foreground/30 transition-all cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: customSolidColor }}
              title="Custom color"
            >
              {!isCustomSolid && (
                <span className="text-[10px] text-muted-foreground">+</span>
              )}
            </label>
            <input
              id="solid-color-picker"
              type="color"
              value={customSolidColor}
              onChange={(e) => {
                setCustomSolidColor(e.target.value);
                onChange("backgroundColor", e.target.value);
              }}
              className="sr-only"
            />
            <span className="text-[11px] text-muted-foreground">
              {isCustomSolid ? backgroundColor : "Pick a custom color"}
            </span>
          </div>
        </div>
      )}

      {/* GRADIENT */}
      {backgroundType === "gradient" && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {GRADIENTS.filter((g) => g.value !== "custom").map((g) => (
              <button
                key={g.value}
                onClick={() => onChange("backgroundGradient", g.value)}
                className={`h-12 rounded-lg border-2 transition-all ${
                  backgroundGradient === g.value
                    ? "border-primary ring-2 ring-primary/30 scale-105"
                    : "border-border hover:scale-105"
                }`}
                style={{ background: g.css }}
                title={g.name}
              />
            ))}
          </div>

          {/* Custom gradient */}
          <div
            className={`rounded-lg border-2 p-3 transition-all cursor-pointer ${
              backgroundGradient === "custom"
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-foreground/20"
            }`}
            onClick={() => onChange("backgroundGradient", "custom")}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">Custom Gradient</span>
              <div
                className="w-16 h-6 rounded-md"
                style={{ background: `linear-gradient(135deg, ${customGradientFrom}, ${customGradientTo})` }}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="grad-from" className="sr-only">From color</label>
                <input
                  id="grad-from"
                  type="color"
                  value={customGradientFrom || "#84cc16"}
                  onChange={(e) => {
                    e.stopPropagation();
                    onChange("customGradientFrom", e.target.value);
                    if (backgroundGradient === "custom") {
                      onChange("backgroundGradient", "custom");
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-md border border-border cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground">From</span>
              </div>
              <svg className="w-4 h-4 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="flex items-center gap-2">
                <label htmlFor="grad-to" className="sr-only">To color</label>
                <input
                  id="grad-to"
                  type="color"
                  value={customGradientTo || "#10b981"}
                  onChange={(e) => {
                    e.stopPropagation();
                    onChange("customGradientTo", e.target.value);
                    if (backgroundGradient === "custom") {
                      onChange("backgroundGradient", "custom");
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-md border border-border cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground">To</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE */}
      {backgroundType === "image" && (
        <div className="space-y-3">
          {backgroundImage && (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={backgroundImage} alt="Background preview" className="w-full h-24 object-cover" />
              <button
                onClick={() => onChange("backgroundImage", "")}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold"
              >
                ×
              </button>
            </div>
          )}
          <label className="block">
            <span className="sr-only">Upload background image</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer"
            />
          </label>
          <p className="text-[11px] text-muted-foreground/60">JPG, PNG, or WEBP. Max 5 MB.</p>
        </div>
      )}
    </div>
  );
}
