import { useState, useRef, useEffect } from 'react';
import { Share2, Link as LinkIcon, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title:       string;
  description: string;
  url?:        string;
  variant?:    'icon' | 'pill';
}

export function ShareButton({ title, description, url, variant = 'pill' }: ShareButtonProps) {
  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const shareUrl  = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${title} — ${description}`;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Could not copy link'); }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`, '_blank', 'noopener');
    setOpen(false);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      '_blank', 'noopener,width=600,height=520');
    setOpen(false);
  };

  // Instagram has no public web share URL — copy the link & instruct the user
  const shareInstagram = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      toast.success('Link copied — paste it in your Instagram story or DM');
    } catch { toast.error('Could not copy link'); }
    setOpen(false);
  };

  // ── Inline brand SVG icons ─────────────────────────────────────────────────
  const WhatsAppIcon = (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.81 11.81 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.894 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
  const FacebookIcon = (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
  const InstagramIcon = (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
    </svg>
  );

  const trigger = variant === 'icon' ? (
    <button onClick={() => setOpen(!open)}
      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition-colors"
      aria-label="Share">
      <Share2 className="w-4 h-4 text-slate-700" />
    </button>
  ) : (
    <button onClick={() => setOpen(!open)}
      className="inline-flex items-center gap-2 bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 px-4 py-2 rounded-full font-poppins text-sm font-medium transition-colors">
      <Share2 className="w-4 h-4" />Share
    </button>
  );

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {trigger}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[240px]">
          <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-gray-100">
            <span className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wider">Share via</span>
            <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-col">
            <button onClick={shareWhatsApp} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left">
              <span className="w-9 h-9 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">{WhatsAppIcon}</span>
              <span className="font-poppins text-sm font-medium text-slate-800">WhatsApp</span>
            </button>
            <button onClick={shareFacebook} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left">
              <span className="w-9 h-9 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shrink-0">{FacebookIcon}</span>
              <span className="font-poppins text-sm font-medium text-slate-800">Facebook</span>
            </button>
            <button onClick={shareInstagram} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left">
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shrink-0">{InstagramIcon}</span>
              <div>
                <div className="font-poppins text-sm font-medium text-slate-800">Instagram</div>
                <div className="font-poppins text-[10px] text-gray-400">Copies link for sharing</div>
              </div>
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button onClick={copyLink} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${copied ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
              </span>
              <span className="font-poppins text-sm font-medium text-slate-800">{copied ? 'Link copied!' : 'Copy link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShareButton;
