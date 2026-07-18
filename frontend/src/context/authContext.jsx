import { createContext, useState, useEffect } from "react";
import { applyTheme } from "../utils/theme";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("linkin_user") || sessionStorage.getItem("linkin_user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      applyTheme(u?.theme || "light");
    } else {
      applyTheme("light");
    }
    setLoading(false);
  }, []);

  /* Re-sync theme whenever user changes (e.g. after public profile visit) */
  useEffect(() => {
    applyTheme(user?.theme || "light");
  }, [user]);

  const login = (userData, token, rememberMe = true) => {
    const userWithToken = { ...userData, token };
    setUser(userWithToken);
    if (rememberMe) {
      localStorage.setItem("linkin_user", JSON.stringify(userWithToken));
    } else {
      sessionStorage.setItem("linkin_user", JSON.stringify(userWithToken));
    }
    applyTheme(userData?.theme || "light");
  };

  const logout = () => {
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