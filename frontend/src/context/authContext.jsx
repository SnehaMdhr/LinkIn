import { createContext, useState, useEffect } from "react";
import { applyTheme } from "../utils/theme";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore user from storage (no token stored — token is in httpOnly cookie)
    const storedUser = localStorage.getItem("linkin_user") || sessionStorage.getItem("linkin_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        applyTheme(u?.theme || "light");
      } catch {
        // Corrupted data, clear it
        localStorage.removeItem("linkin_user");
        sessionStorage.removeItem("linkin_user");
      }
    } else {
      applyTheme("light");
    }
    setLoading(false);
  }, []);

  /* Re-sync theme whenever user changes */
  useEffect(() => {
    applyTheme(user?.theme || "light");
  }, [user]);

  const login = (userData, token, rememberMe = true) => {
    // Preserve existing token if a new one isn't provided
    const resolvedToken = token !== undefined ? token : userData?.token;
    const userWithToken = { ...userData, token: resolvedToken };
    setUser(userWithToken);
    if (rememberMe) {
      localStorage.setItem("linkin_user", JSON.stringify(userWithToken));
    } else {
      sessionStorage.setItem("linkin_user", JSON.stringify(userWithToken));
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