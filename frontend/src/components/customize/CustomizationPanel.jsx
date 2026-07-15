import AppearanceSection from "./AppearanceSection";
import CardSection from "./CardSection";
import AccentSection from "./AccentSection";
import TextColorSection from "./TextColorSection";
import TypographySection from "./TypographySection";
import LayoutSection from "./LayoutSection";
import ButtonSection from "./ButtonSection";
import VisibilitySection from "./VisibilitySection";
import AnimationSection from "./AnimationSection";

export default function CustomizationPanel({ customization, onChange }) {
  const sections = [
    { key: "appearance", Component: AppearanceSection },
    { key: "card", Component: CardSection },
    { key: "accent", Component: AccentSection },
    { key: "textColor", Component: TextColorSection },
    { key: "typography", Component: TypographySection },
    { key: "layout", Component: LayoutSection },
    { key: "buttons", Component: ButtonSection },
    { key: "visibility", Component: VisibilitySection },
    { key: "animation", Component: AnimationSection },
  ];

  return (
    <div className="space-y-6">
      {sections.map(({ key, Component }) => (
        <div key={key} className="pb-6 border-b border-border/50 last:border-0 last:pb-0">
          <Component customization={customization} onChange={onChange} />
        </div>
      ))}
    </div>
  );
}
