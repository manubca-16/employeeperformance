import React, { useState, ReactNode } from "react";
import { User, Role } from "@/types/models";
import { AuthContext } from "@/context/auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("pp_token");
    if (!token) {
      localStorage.removeItem("pp_user");
      return null;
    }

    const stored = localStorage.getItem("pp_user");
    try {
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      localStorage.removeItem("pp_user");
      return null;
    }
  });
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
      if (data.user) {
        localStorage.setItem("pp_user", JSON.stringify(data.user));
      }
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
    localStorage.removeItem("pp_user");
  };
  const isRole = (role: Role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isRole }}>
      {children}
    </AuthContext.Provider>
  );
};
