import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineModeIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-20 right-6 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            isOffline
              ? 'bg-red-600 text-white'
              : 'bg-green-600 text-white'
          }`}
        >
          {isOffline ? (
            <>
              <WifiOff className="w-5 h-5" />
              <span className="font-semibold">You're offline. Some features may be limited.</span>
            </>
          ) : (
            <>
              <Wifi className="w-5 h-5" />
              <span className="font-semibold">Back online!</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
