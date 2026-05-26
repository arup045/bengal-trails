import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

// Lightweight, zero-risk offline awareness: shows a calm banner when the browser
// goes offline and clears it on reconnect. Cached data (wishlist, recently-viewed,
// site content) still renders from localStorage while offline. This is the safe
// part of "offline mode" — full service-worker precaching is a separate, careful
// change to avoid stale-content bugs for real users.
export function OfflineIndicator() {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-sm font-poppins px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You're offline — showing your saved places & cached content.</span>
    </div>
  );
}
