import { createContext, useState, useEffect } from "react";
import { applyTheme } from "../utils/theme";
import api, { fetchCsrfToken } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch CSRF token on app start
    fetchCsrfToken();

    (async () => {
      // Try to verify the session using the httpOnly cookie (sent automatically)
      try {
        const res = await api.get("/profile");
        // Cookie-based auth succeeded — restore user from response
        const u = res.data;
        // Also restore cached user from storage for theme/display (without token)
        const cached = localStorage.getItem("linkin_user") || sessionStorage.getItem("linkin_user");
        const cachedData = cached ? JSON.parse(cached) : {};
        // Merge: API response has the freshest data, cached has theme/customization
        const merged = { ...cachedData, ...u };
        setUser(merged);
        applyTheme(merged?.theme || u?.theme || "light");
      } catch {
        // No valid session cookie — user is not logged in
        localStorage.removeItem("linkin_user");
        sessionStorage.removeItem("linkin_user");
        applyTheme("light");
      }
      setLoading(false);
    })();

    // Listen for forced-logout events (fired by API interceptor on 401)
    const onForcedLogout = () => {
      setUser(null);
      localStorage.removeItem("linkin_user");
      sessionStorage.removeItem("linkin_user");
      applyTheme("light");
    };
    window.addEventListener("auth:logout", onForcedLogout);
    return () => window.removeEventListener("auth:logout", onForcedLogout);
  }, []);

  /* Re-sync theme whenever user changes */
  useEffect(() => {
    applyTheme(user?.theme || "light");
  }, [user]);

  const login = (userData, token, rememberMe = true) => {
    // Strip token before storing — JWT lives ONLY in the httpOnly cookie now
    const { token: _, ...userWithoutToken } = userData;
    setUser(userWithoutToken);
    if (rememberMe) {
      localStorage.setItem("linkin_user", JSON.stringify(userWithoutToken));
    } else {
      sessionStorage.setItem("linkin_user", JSON.stringify(userWithoutToken));
    }
    applyTheme(userData?.theme || "light");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the request fails, clear local state
    }
    setUser(null);
    localStorage.removeItem("linkin_user");
    localStorage.removeItem("linkin_token");
    applyTheme("light");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}