import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import AppearanceSection from "./AppearanceSection";
import CardSection from "./CardSection";
import AccentSection from "./AccentSection";
import TextColorSection from "./TextColorSection";
import TypographySection from "./TypographySection";
import LayoutSection from "./LayoutSection";
import ButtonSection from "./ButtonSection";
import VisibilitySection from "./VisibilitySection";
import AnimationSection from "./AnimationSection";

const SECTIONS = [
  { key: "appearance", label: "Appearance", Component: AppearanceSection },
  { key: "card", label: "Card", Component: CardSection },
  { key: "accent", label: "Accent Color", Component: AccentSection },
  { key: "textColor", label: "Text Colors", Component: TextColorSection },
  { key: "typography", label: "Typography", Component: TypographySection },
  { key: "layout", label: "Layout", Component: LayoutSection },
  { key: "buttons", label: "Buttons", Component: ButtonSection },
  { key: "visibility", label: "Visibility", Component: VisibilitySection },
  { key: "animation", label: "Animation", Component: AnimationSection },
];

function Section({ label, isOpen, onToggle, children }) {
  return (
    <div className="mb-3 last:mb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border hover:border-foreground/20 transition-all group"
      >
        <span className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors">
          {label}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`content-${label}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CustomizationPanel({ customization, onChange, activeSection, onSectionChange }) {
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    SECTIONS.forEach((s) => {
      initial[s.key] = s.key === activeSection;
    });
    return initial;
  });

  // When sidebar item is clicked, open that section
  useEffect(() => {
    if (activeSection) {
      setOpenSections((prev) => ({ ...prev, [activeSection]: true }));
    }
  }, [activeSection]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    onSectionChange(key);
  };

  return (
    <div>
      {SECTIONS.map(({ key, label, Component }) => (
        <Section
          key={key}
          label={label}
          isOpen={openSections[key]}
          onToggle={() => toggleSection(key)}
        >
          <Component customization={customization} onChange={onChange} />
        </Section>
      ))}
    </div>
  );
}
