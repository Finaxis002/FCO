import { useState, useEffect } from 'react';
import { getRemainingSessionTimeFormatted } from '@/utils/logout';
import { Clock, LogOut } from 'lucide-react';

interface SessionTimerProps {
  showWarning?: boolean;
  warningThreshold?: number; // Show warning when less than this many minutes remaining
  onTimeout?: () => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ 
  showWarning = true, 
  warningThreshold = 30, // 30 minutes
  onTimeout 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const formattedTime = getRemainingSessionTimeFormatted();
      setTimeRemaining(formattedTime);

      // Check if we're in warning period
      if (showWarning && formattedTime.includes('m')) {
        const minutes = parseInt(formattedTime);
        if (minutes <= warningThreshold && minutes > 0) {
          setShowLogoutPrompt(true);
        }
      }

      // If session expired
      if (formattedTime === "Session expired") {
        setShowLogoutPrompt(false);
        if (onTimeout) {
          onTimeout();
        }
      }
    };

    // Update immediately
    updateTimer();

    // Update every minute
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [showWarning, warningThreshold, onTimeout]);

  // Don't show anything if no time remaining
  if (!timeRemaining || timeRemaining === "Session expired") {
    return null;
  }

  return (
    <>
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Clock className="h-4 w-4" />
        <span>Session expires in: {timeRemaining}</span>
      </div>

      {showLogoutPrompt && (
        <div className="fixed top-4 right-4 bg-orange-100 border border-orange-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
          <div className="flex items-start space-x-3">
            <LogOut className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-orange-800">
                Session Timeout Warning
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                Your session will expire in {timeRemaining}. 
                Please save your work and log in again if needed.
              </p>
              <button
                onClick={() => setShowLogoutPrompt(false)}
                className="mt-2 text-sm text-orange-600 hover:text-orange-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionTimer;