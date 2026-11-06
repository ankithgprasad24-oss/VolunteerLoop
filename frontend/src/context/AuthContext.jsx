import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("volunteerloop_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", credentials);
      localStorage.setItem("volunteerloop_token", data.token);
      localStorage.setItem("volunteerloop_user", JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (details) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", details);
      localStorage.setItem("volunteerloop_token", data.token);
      localStorage.setItem("volunteerloop_user", JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("volunteerloop_token");
    localStorage.removeItem("volunteerloop_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
