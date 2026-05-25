import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'bt_cookie_consent_v1';

type Choice = 'accepted' | 'rejected';

export function getCookieConsent(): Choice | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'accepted' || v === 'rejected' ? v : null;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getCookieConsent() === null) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const choose = (c: Choice) => {
    localStorage.setItem(STORAGE_KEY, c);
    setVisible(false);
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: c }));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 22 }}
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[60] bg-white border border-gray-200 shadow-2xl rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">We use cookies</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Essential cookies keep you signed in. Analytics cookies help us improve Bengal Trails. Read our{' '}
                <a href="/cookies" className="text-[#7d1f2e] underline">
                  Cookie Policy
                </a>
                .
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => choose('accepted')}
                  className="px-4 py-2 rounded-full bg-[#7d1f2e] text-white text-sm hover:bg-[#5a1621] transition-colors"
                >
                  Accept all
                </button>
                <button
                  onClick={() => choose('rejected')}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 text-sm hover:bg-gray-200 transition-colors"
                >
                  Essential only
                </button>
              </div>
            </div>
            <button
              onClick={() => choose('rejected')}
              aria-label="Dismiss"
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
