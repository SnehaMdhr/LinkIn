/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- shadcn/ui COLOR TOKENS (mapped to CSS variables for light/dark) ---
      colors: {
        /* Top-level shadcn color names (so bg-background, text-foreground, etc. work) */
        background: "rgb(var(--md-background, 251 252 248) / <alpha-value>)",
        foreground: "rgb(var(--md-foreground, 15 23 42) / <alpha-value>)",
        card: "rgb(var(--md-surface, 255 255 255) / <alpha-value>)",
        "card-foreground": "rgb(var(--md-foreground, 15 23 42) / <alpha-value>)",
        popover: "rgb(var(--md-surface, 255 255 255) / <alpha-value>)",
        "popover-foreground": "rgb(var(--md-foreground, 15 23 42) / <alpha-value>)",
        primary: "rgb(var(--md-primary, 175 243 62) / <alpha-value>)",
        "primary-foreground": "rgb(var(--md-primary-foreground, 0 0 0) / <alpha-value>)",
        secondary: "rgb(var(--md-secondary, 51 65 85) / <alpha-value>)",
        "secondary-foreground": "rgb(var(--md-secondary-foreground, 248 250 252) / <alpha-value>)",
        muted: "rgb(var(--md-muted, 241 245 249) / <alpha-value>)",
        "muted-foreground": "rgb(var(--md-muted-foreground, 100 116 139) / <alpha-value>)",
        accent: "rgb(var(--md-accent, 240 253 244) / <alpha-value>)",
        "accent-foreground": "rgb(var(--md-accent-foreground, 22 101 52) / <alpha-value>)",
        destructive: "rgb(var(--md-destructive, 239 68 68) / <alpha-value>)",
        "destructive-foreground": "rgb(var(--md-destructive-foreground, 255 255 255) / <alpha-value>)",
        border: "rgb(var(--md-border, 226 232 240) / <alpha-value>)",
        input: "rgb(var(--md-input, 226 232 240) / <alpha-value>)",
        ring: "rgb(var(--md-ring, 175 243 62) / <alpha-value>)",

        /* md- prefixed backward-compatible names */
        md: {
          background: "rgb(var(--md-background, 251 252 248) / <alpha-value>)",
          surface: "rgb(var(--md-surface, 255 255 255) / <alpha-value>)",
          "on-surface": "rgb(var(--md-foreground, 15 23 42) / <alpha-value>)",
          "on-surface-variant": "rgb(var(--md-muted-foreground, 100 116 139) / <alpha-value>)",
          "surface-container": "rgb(var(--md-muted, 241 245 249) / <alpha-value>)",
          "surface-container-low": "rgb(var(--md-secondary, 51 65 85) / <alpha-value>)",
          primary: "rgb(var(--md-primary, 175 243 62) / <alpha-value>)",
          "on-primary": "rgb(var(--md-primary-foreground, 0 0 0) / <alpha-value>)",
          "primary-container": "rgb(var(--md-accent, 240 253 244) / <alpha-value>)",
          "on-primary-container": "rgb(var(--md-accent-foreground, 22 101 52) / <alpha-value>)",
          "secondary-container": "rgb(var(--md-secondary, 51 65 85) / <alpha-value>)",
          "on-secondary-container": "rgb(var(--md-secondary-foreground, 248 250 252) / <alpha-value>)",
          tertiary: "rgb(var(--md-accent-foreground, 22 101 52) / <alpha-value>)",
          "on-tertiary": "rgb(var(--md-on-tertiary, 0 0 0) / <alpha-value>)",
          "tertiary-container": "rgb(var(--md-accent, 240 253 244) / <alpha-value>)",
          "on-tertiary-container": "rgb(var(--md-accent-foreground, 22 101 52) / <alpha-value>)",
          outline: "rgb(var(--md-border, 226 232 240) / <alpha-value>)",
          error: "rgb(var(--md-destructive, 239 68 68) / <alpha-value>)",
          "on-error": "rgb(var(--md-destructive-foreground, 255 255 255) / <alpha-value>)",
          "error-container": "rgb(var(--md-error-container, 254 226 226) / <alpha-value>)",
          "on-error-container": "rgb(var(--md-on-error-container, 153 27 27) / <alpha-value>)",
        },
      },

      // --- SHADCN BORDER RADII ---
      borderRadius: {
        "md-xs": "6px",
        "md-sm": "6px",
        md: "8px",
        "md-lg": "8px",
        "md-xl": "12px",
        "md-2xl": "16px",
        "md-3xl": "24px",
      },

      // --- SHADCN FONTS ---
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      // --- KEYFRAMES (organic blur float + entrance) ---
      keyframes: {
        "md-drift": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg) scale(1)" },
          "33%": { transform: "translateY(-12px) rotate(1.5deg) scale(1.02)" },
          "66%": { transform: "translateY(-6px) rotate(-1deg) scale(0.98)" },
        },
        "md-drift-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-18px) rotate(3deg)" },
        },
        "md-fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "md-scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },

      // --- ANIMATIONS ---
      animation: {
        "md-drift": "md-drift 10s ease-in-out infinite",
        "md-drift-slow": "md-drift-slow 14s ease-in-out infinite",
        "md-fade-in": "md-fade-in 400ms cubic-bezier(0.2, 0, 0, 1)",
        "md-scale-in": "md-scale-in 300ms cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
