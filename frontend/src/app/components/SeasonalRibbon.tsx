import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { getActiveSeason } from '../utils/seasonalTheme';

// A slim, dismissible seasonal accent strip that reflects the month's real
// signature Bengal festival and links to the Festival Calendar. Dismissal is
// remembered per-season so it never nags.
export function SeasonalRibbon() {
  const season = getActiveSeason();
  const storageKey = season ? `seasonal-ribbon-dismissed-${season.id}` : '';
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try { return season ? localStorage.getItem(storageKey) === '1' : true; } catch { return false; }
  });

  if (!season || dismissed) return null;

  const close = () => {
    setDismissed(true);
    try { localStorage.setItem(storageKey, '1'); } catch { /* ignore */ }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`relative bg-gradient-to-r ${season.gradient} border-b border-black/5`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-1.5 flex items-center justify-center gap-2 text-center">
          <span className="text-base leading-none">{season.emoji}</span>
          <p className="font-poppins text-xs sm:text-sm text-slate-700">
            <span className="font-semibold">{season.label}</span>
            <span className="hidden sm:inline text-slate-500"> — {season.note}</span>
          </p>
          <a href="/festivals"
            className="font-poppins text-xs font-semibold text-purple-700 hover:text-purple-900 underline-offset-2 hover:underline whitespace-nowrap">
            See festivals
          </a>
          <button onClick={close} aria-label="Dismiss"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-black/5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SeasonalRibbon;
