import { useState } from 'react';
import { Share2, Link, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, description, image, url, className = '' }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const shareUrl = url || window.location.href;
  const text = `${title} — Explore West Bengal on Bengal Trails`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
    setOpen(false);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        setOpen(false);
      } catch { /* user dismissed */ }
    } else {
      copyLink();
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + shareUrl)}`, '_blank');
    setOpen(false);
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
    setOpen(false);
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200
                   font-poppins text-sm font-medium text-gray-700
                   hover:bg-gray-50 hover:border-gray-300 transition-all">
        <Share2 className="w-4 h-4" />
        Share
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit={{    opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200
                         rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-poppins text-xs font-semibold text-slate-900">Share this place</span>
                <button onClick={() => setOpen(false)}><X className="w-3.5 h-3.5 text-gray-400" /></button>
              </div>

              {[
                { icon: '📋', label: 'Copy link',      action: copyLink },
                { icon: '📱', label: 'Share via…',     action: shareNative, hide: !navigator.share },
                { icon: '💬', label: 'WhatsApp',       action: shareWhatsApp },
                { icon: '✈️', label: 'Telegram',       action: shareTelegram },
                { icon: '𝕏',  label: 'Post on X',     action: shareTwitter },
              ].filter(i => !i.hide).map(item => (
                <button key={item.label} onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left
                             font-poppins text-sm text-slate-700 hover:bg-gray-50 transition-colors">
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
