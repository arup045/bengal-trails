import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LANGS: { code: 'en' | 'bn' | 'hi'; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'hi', label: 'Hindi',   native: 'हिंदी' },
];

/** Compact language switcher — sets the app language (persisted via LanguageContext). */
export function LanguageSwitcher({ variant = 'header' }: { variant?: 'header' | 'sheet' }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === language) || LANGS[0];

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  if (variant === 'sheet') {
    return (
      <div>
        <div className="px-3.5 mb-1.5 font-poppins text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Language</div>
        <div className="flex gap-1.5 px-3.5">
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => setLanguage(l.code)}
              className={`flex-1 px-2 py-2 rounded-xl font-poppins text-sm font-medium transition-colors ${language === l.code ? 'bg-purple-600 text-white' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}>
              {l.native}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-label="Change language" aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-full text-slate-700 hover:bg-gray-100 transition-colors duration-150">
        <Globe className="w-4 h-4" />
        <span className="hidden lg:inline font-poppins text-sm font-medium">{current.native}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden z-50">
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => { setLanguage(l.code); setOpen(false); }}
              className={`flex items-center justify-between w-full px-4 py-2.5 font-poppins text-sm transition-colors ${language === l.code ? 'text-purple-700 bg-purple-50 font-semibold' : 'text-slate-700 hover:bg-gray-50'}`}>
              <span>{l.native}</span>
              {language === l.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
