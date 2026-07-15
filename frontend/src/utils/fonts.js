const loadedFonts = new Set();

export function loadFont(fontName) {
  if (loadedFonts.has(fontName)) return;
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s/g, "+")}:wght@400;500;600;700&display=swap`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
  loadedFonts.add(fontName);
}

export function getFontFamily(fontName) {
  return `'${fontName}', system-ui, sans-serif`;
}
