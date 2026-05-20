import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../utils/useSiteContent';

export function AnnouncementBar() {
  const { content } = useSiteContent();
  const ann = content.announcement;
  const [dismissed, setDismissed] = useState(false);

  if (!ann.enabled || dismissed) return null;

  return (
    <div
      className="relative flex items-center justify-center px-4 py-2.5 text-white text-sm font-poppins font-medium"
      style={{ backgroundColor: ann.bgColor || '#7c3aed' }}
    >
      <a
        href={ann.link || '#/explore'}
        className="flex items-center gap-1.5 hover:underline underline-offset-2"
      >
        {ann.text}
        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
      </a>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
