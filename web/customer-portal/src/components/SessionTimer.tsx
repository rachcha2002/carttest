import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const SessionTimer: React.FC = () => {
  const { token, sessionTimeRemaining, refreshToken, isAuthenticated } =
    useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [lastDismissed, setLastDismissed] = useState<number | null>(null);

  // Control warning visibility
  useEffect(() => {
    if (!isAuthenticated || !sessionTimeRemaining) {
      setShowWarning(false);
      return;
    }

    // Don't show warning if user dismissed it recently (unless urgent)
    if (
      lastDismissed &&
      Date.now() - lastDismissed < 60000 && // 1 minute cooldown
      sessionTimeRemaining > 120 // 2 minutes is urgent threshold
    ) {
      setShowWarning(false);
      return;
    }

    // Show warning based on thresholds
    setIsUrgent(sessionTimeRemaining < 120); // 2 minutes
    setShowWarning(sessionTimeRemaining < 300); // 5 minutes

    // Auto-refresh when urgent
    if (sessionTimeRemaining < 30 && sessionTimeRemaining > 10) {
      refreshToken();
    }
  }, [sessionTimeRemaining, isAuthenticated, lastDismissed, refreshToken]);

  const handleDismiss = () => {
    setLastDismissed(Date.now());
    setShowWarning(false);
  };

  const handleExtend = async () => {
    await refreshToken();
    setShowWarning(false);
  };

  // If not showing warning or no time data, render nothing
  if (!showWarning || !sessionTimeRemaining) return null;

  // Format time as mm:ss
  const minutes = Math.floor(sessionTimeRemaining / 60);
  const seconds = sessionTimeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
        isUrgent
          ? "bg-red-100 border border-red-500 text-red-700"
          : "bg-yellow-100 border border-yellow-400 text-yellow-700"
      }`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {isUrgent ? (
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium">
            {isUrgent ? "Session Almost Expired!" : "Session Expiring Soon"}
          </h3>
          <div className="mt-2 text-sm">
            <p>Your session will expire in {formattedTime}</p>
            {isUrgent && (
              <p className="font-medium mt-1">
                Any unsaved orders or changes will be lost!
              </p>
            )}
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleExtend}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                isUrgent
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              Extend Session
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimer;
