import { NavigateFunction } from "react-router-dom";

/**
 * Utility function to handle complete logout
 * @param navigate - React Router navigation function (optional)
 */
export const logout = (navigate?: NavigateFunction) => {
  // Clear all authentication data from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('user');
  localStorage.removeItem('loginTime');
  
  // If navigate function is provided, redirect to login
  if (navigate) {
    navigate('/login', { replace: true });
  } else {
    // Fallback to manual redirect if navigate function not available
    window.location.href = '/login';
  }
};

/**
 * Check if user session has expired
 * @returns boolean - true if session has expired
 */
export const isSessionExpired = (): boolean => {
  const loginTime = localStorage.getItem('loginTime');
  if (!loginTime) return true;
  
  const currentTime = Date.now();
  const loginTimestamp = parseInt(loginTime, 10);
  const elapsedTime = currentTime - loginTimestamp;
  const AUTO_LOGOUT_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  return elapsedTime >= AUTO_LOGOUT_TIME;
};

/**
 * Get remaining session time in milliseconds
 * @returns number - remaining time in milliseconds, 0 if expired
 */
export const getRemainingSessionTime = (): number => {
  const loginTime = localStorage.getItem('loginTime');
  if (!loginTime) return 0;
  
  const currentTime = Date.now();
  const loginTimestamp = parseInt(loginTime, 10);
  const elapsedTime = currentTime - loginTimestamp;
  const AUTO_LOGOUT_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  const remainingTime = AUTO_LOGOUT_TIME - elapsedTime;
  return Math.max(0, remainingTime);
};

/**
 * Get remaining session time in human readable format
 * @returns string - formatted time remaining (e.g., "2 hours 30 minutes")
 */
export const getRemainingSessionTimeFormatted = (): string => {
  const remainingTime = getRemainingSessionTime();
  if (remainingTime === 0) return "Session expired";
  
  const hours = Math.floor(remainingTime / (1000 * 60 * 60));
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
};