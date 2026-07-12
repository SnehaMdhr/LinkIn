import { createContext, useState, useEffect } from "react";
import { applyTheme } from "../utils/theme";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("linkin_user") || sessionStorage.getItem("linkin_user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      applyTheme(u?.theme || "light");
    } else {
      applyTheme("light");
    }
  }, []);

  /* Re-sync theme whenever user changes (e.g. after public profile visit) */
  useEffect(() => {
    applyTheme(user?.theme || "light");
  }, [user]);

  const login = (userData, rememberMe = true) => {
    setUser(userData);
    if (rememberMe) {
      localStorage.setItem("linkin_user", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("linkin_user", JSON.stringify(userData));
    }
    applyTheme(userData?.theme || "light");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("linkin_user");
    sessionStorage.removeItem("linkin_user");
    applyTheme("light");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}