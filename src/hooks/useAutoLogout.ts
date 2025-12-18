import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/utils/logout';

// Auto logout after 24 hours (24 * 60 * 60 * 1000 milliseconds)
const AUTO_LOGOUT_TIME = 24 * 60 * 60 * 1000;

export const useAutoLogout = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Get login time from localStorage
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) {
      // If no login time exists, logout immediately
      logout(navigate);
      return;
    }

    const currentTime = Date.now();
    const loginTimestamp = parseInt(loginTime, 10);
    const elapsedTime = currentTime - loginTimestamp;

    // If 24 hours have already passed, logout immediately
    if (elapsedTime >= AUTO_LOGOUT_TIME) {
      logout(navigate);
      return;
    }

    // Set timeout for remaining time
    const remainingTime = AUTO_LOGOUT_TIME - elapsedTime;
    timeoutRef.current = setTimeout(() => {
      logout(navigate);
    }, remainingTime);
  };

  const setLoginTime = () => {
    localStorage.setItem('loginTime', Date.now().toString());
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      return; // Don't start timer if not authenticated
    }

    // Start the auto logout timer
    resetTimer();

    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleUserActivity = () => {
      resetTimer();
    };

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Cleanup function
    return () => {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Remove event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [navigate]);

  return {
    setLoginTime,
    resetTimer
  };
};