import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import api from "../services/api";
import { isDark, applyTheme } from "../utils/theme";

export default function ThemeDropdown() {
  const { user, login } = useContext(AuthContext);
  const [dark, setDark] = useState(() => isDark(user?.theme));

  /* Keep local state in sync when user or external theme changes */
  useEffect(() => {
    setDark(isDark(user?.theme));
  }, [user?.theme]);

  const toggle = async () => {
    const newTheme = dark ? "light" : "dark";

    if (user) {
      /* Logged-in: update context + persist to backend */
      login({ ...user, theme: newTheme });
      try {
        await api.put("/profile", { userId: user.id, theme: newTheme });
      } catch {
        /* silently fail */
      }
    } else {
      /* Guest: just toggle the class on <html> */
      setDark(!dark);
      applyTheme(newTheme);
    }
  };

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun icon (shown in dark mode) */}
      <svg
        className={`w-5 h-5 absolute transition-all duration-300 ${dark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      {/* Moon icon (shown in light mode) */}
      <svg
        className={`w-5 h-5 absolute transition-all duration-300 ${dark ? "opacity-0 -rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    </button>
  );
}
