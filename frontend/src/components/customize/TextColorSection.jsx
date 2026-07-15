import { useState } from "react";
import { TEXT_COLORS } from "../../config/customization";

function ColorRow({ label, description, colorValue, onChange }) {
  const [customColor, setCustomColor] = useState(colorValue);
  const isCustom = !TEXT_COLORS.some((c) => c.value === colorValue);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-foreground">{label}</span>
          {description && (
            <span className="text-[10px] text-muted-foreground/60 block">{description}</span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{colorValue}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TEXT_COLORS.map((c) => (
          <button
            key={c.value}
            title={c.name}
            onClick={() => {
              onChange(c.value);
              setCustomColor(c.value);
            }}
            className={`w-7 h-7 rounded-full border-2 transition-all ${
              colorValue === c.value && !isCustom
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
            htmlFor={`text-color-${label}`}
            className="w-7 h-7 rounded-full border-2 border-dashed border-border hover:border-foreground/30 transition-all cursor-pointer flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: customColor }}
            title="Custom color"
          >
            {!isCustom && (
              <span className="text-[9px] text-muted-foreground">+</span>
            )}
          </label>
          <input
            id={`text-color-${label}`}
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              onChange(e.target.value);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-7 h-7"
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          {isCustom ? "Custom" : "Pick any color"}
        </span>
      </div>
    </div>
  );
}

export default function TextColorSection({ customization, onChange }) {
  const { textColor, textColorSecondary } = customization;

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-foreground">Text Colors</h3>

      <ColorRow
        label="Primary Text"
        description="Name & headings"
        colorValue={textColor}
        onChange={(val) => onChange("textColor", val)}
      />

      <ColorRow
        label="Secondary Text"
        description="Username, bio & muted text"
        colorValue={textColorSecondary}
        onChange={(val) => onChange("textColorSecondary", val)}
      />
    </div>
  );
}
