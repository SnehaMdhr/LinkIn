/**
 * Valid themes: "light" or "dark" (shadcn/ui style).
 * Gracefully downgrades any old daisyUI theme string.
 */
export const VALID_THEMES = ["light", "dark"];

/**
 * Returns a valid theme, falling back to "light".
 */
export function validTheme(theme) {
  return VALID_THEMES.includes(theme) ? theme : "light";
}

/**
 * Returns true if the theme is dark.
 */
export function isDark(theme) {
  return validTheme(theme) === "dark";
}

/**
 * Apply the theme to the <html> element.
 * Adds/removes the "dark" class and sets a data attribute.
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  const isDarkMode = isDark(theme);
  root.classList.toggle("dark", isDarkMode);
  root.dataset.theme = isDarkMode ? "dark" : "light";
}
