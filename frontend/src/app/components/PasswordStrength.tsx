import { useState, useEffect } from 'react';

interface Props { password: string; }

const LEVELS = [
  { label: 'Very weak', color: 'bg-red-400',    text: 'text-red-500'    },
  { label: 'Weak',      color: 'bg-orange-400',  text: 'text-orange-500' },
  { label: 'Fair',      color: 'bg-yellow-400',  text: 'text-yellow-600' },
  { label: 'Strong',    color: 'bg-green-400',   text: 'text-green-600'  },
  { label: 'Very strong',color:'bg-green-600',   text: 'text-green-700'  },
];

// zxcvbn ships ~400 KB (gzipped) of wordlists. Statically importing it forced
// that weight into the sign-in chunk for every visitor. We now load it on demand
// the first time a user actually types a password — same scoring, same UI, but it
// no longer bloats the initial bundle. The module is cached after first load.
type ZxcvbnFn = (pw: string) => { score: number; feedback?: { suggestions?: string[] } };
let _zxcvbn: ZxcvbnFn | null = null;
let _zxcvbnPromise: Promise<ZxcvbnFn> | null = null;
function loadZxcvbn(): Promise<ZxcvbnFn> {
  if (_zxcvbn) return Promise.resolve(_zxcvbn);
  if (!_zxcvbnPromise) {
    _zxcvbnPromise = import('zxcvbn').then((m) => {
      _zxcvbn = ((m as any).default || m) as ZxcvbnFn;
      return _zxcvbn;
    });
  }
  return _zxcvbnPromise;
}

export function PasswordStrength({ password }: Props) {
  const [result, setResult] = useState<ReturnType<ZxcvbnFn> | null>(null);

  useEffect(() => {
    if (!password) { setResult(null); return; }
    let cancelled = false;
    loadZxcvbn()
      .then((zxcvbn) => { if (!cancelled) setResult(zxcvbn(password)); })
      .catch(() => { /* strength meter is non-essential — fail silently */ });
    return () => { cancelled = true; };
  }, [password]);

  if (!password) return null;

  const score = result?.score ?? 0;
  const level = LEVELS[score];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0,1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300
            ${i <= score ? level.color : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`font-poppins text-xs font-medium ${level.text}`}>{level.label}</span>
        {result?.feedback?.suggestions?.[0] && (
          <span className="font-poppins text-xs text-gray-400 truncate max-w-[200px]">
            {result.feedback.suggestions[0]}
          </span>
        )}
      </div>
    </div>
  );
}
