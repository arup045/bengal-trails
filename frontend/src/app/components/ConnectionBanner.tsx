import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { API_BASE } from '../utils/api';
import { subscribeApi, isApiDown, setApiUp } from '../utils/connection';

// Health endpoint lives at the server ROOT (not under /api).
const HEALTH_URL = API_BASE.replace(/\/api\/?$/, '') + '/healthz';

// One calm, site-wide banner shown only while the API is unreachable. It polls
// the server and clears itself the moment it responds (e.g. after a free-tier
// cold start), so users never get stuck on a scary per-page error.
export function ConnectionBanner() {
  const [down, setDown] = useState(isApiDown());

  useEffect(() => subscribeApi(setDown), []);

  useEffect(() => {
    if (!down) return;
    let alive = true;
    const probe = async () => {
      try {
        const r = await fetch(HEALTH_URL, { cache: 'no-store' });
        if (alive && r) setApiUp(); // any response means the server is reachable
      } catch { /* still waking */ }
    };
    probe();
    const id = setInterval(probe, 4000);
    return () => { alive = false; clearInterval(id); };
  }, [down]);

  if (!down) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[60] bg-amber-500 text-white text-sm font-poppins px-4 py-2 flex items-center justify-center gap-2 shadow-md">
      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      <span>Waking up the server… the first visit can take up to a minute. Content loads automatically — no need to refresh.</span>
    </div>
  );
}
