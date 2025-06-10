// Create this if you don't have it already
// src/context/AuthContext.tsx
import { createContext, useContext } from 'react';

interface AuthContextType {
  currentUser: any; // Replace 'any' with your user type
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);