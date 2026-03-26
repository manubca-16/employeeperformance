import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, Role } from "@/types/models";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => false,
  logout: () => {},
  isRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("pp_token"));

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      setUser(data.user || null);
      setToken(data.token || null);
      if (data.token) {
        localStorage.setItem("pp_token", data.token);
      }
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("pp_token");
  };
  const isRole = (role: Role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isRole }}>
      {children}
    </AuthContext.Provider>
  );
};
