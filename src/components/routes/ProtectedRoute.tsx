// src/components/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token"); // Or get from Redux state
  const loginTime = localStorage.getItem("loginTime");
  
  // Check if token exists
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if session has expired (24 hours)
  if (loginTime) {
    const currentTime = Date.now();
    const loginTimestamp = parseInt(loginTime, 10);
    const elapsedTime = currentTime - loginTimestamp;
    const AUTO_LOGOUT_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (elapsedTime >= AUTO_LOGOUT_TIME) {
      // Session expired, clear auth data and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      localStorage.removeItem("loginTime");
      return <Navigate to="/login" replace />;
    }
  } else {
    // If no login time exists but token exists, redirect to login
    // This handles edge cases where login time wasn't set properly
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
