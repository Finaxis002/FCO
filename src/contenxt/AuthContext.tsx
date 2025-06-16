// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface UserType {
  _id: string;
  name: string;
  role: string;
  // Add more fields as needed
}

interface AuthContextType {
  currentUser: UserType | null;
  token: string | null;
  loading: boolean;
  login: (user: UserType, token: string) => void;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  currentUser: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore from localStorage on first load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Login handler (call this after successful login)
  const login = (user: UserType, token: string) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setCurrentUser(user);
    setToken(token);
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
