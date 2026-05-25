import { useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles, Database, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { authFetch } from '../../utils/api';

interface EmbedStatus {
  running: boolean;
  processed: number;
  total: number;
  ok: number;
  failed: number;
  startedAt: number | null;
  finishedAt: number | null;
  error: string | null;
  storedCount: number;
  hasKey: boolean;
}

const EMPTY: EmbedStatus = {
  running: false, processed: 0, total: 0, ok: 0, failed: 0,
  startedAt: null, finishedAt: null, error: null, storedCount: 0, hasKey: false,
};

// Admin-triggered semantic-search embedding generation. Lets free-tier hosts
// (no Shell access) activate AI search with one click and watch live progress.
export function AdminEmbeddings() {
  const [status, setStatus] = useState<EmbedStatus>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [force, setForce] = useState(false);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await authFetch('/admin/embed/status');
      if (res.ok) { const data = await res.json(); setStatus((prev) => ({ ...prev, ...data })); }
    } catch { /* keep last known */ }
    finally { setLoading(false); }
  };

  // Poll while a run is active; stop when it finishes.
  useEffect(() => {
    fetchStatus();
    return () => { if (poll.current) clearInterval(poll.current); };
  }, []);

  useEffect(() => {
    if (status.running && !poll.current) {
      poll.current = setInterval(fetchStatus, 1500);
    } else if (!status.running && poll.current) {
      clearInterval(poll.current);
      poll.current = null;
    }
  }, [status.running]);

  const start = async () => {
    setStarting(true);
    try {
      const res = await authFetch('/admin/embed', { method: 'POST', body: JSON.stringify({ force }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Could not start'); return; }
      if (data.started === false) { toast.info(data.message || 'Already running'); }
      else { toast.success('Embedding generation started'); }
      if (data.state) setStatus((prev) => ({ ...prev, ...data.state }));
      fetchStatus();
    } catch { toast.error('Could not start. Try again.'); }
    finally { setStarting(false); }
  };

  const pct = status.total > 0 ? Math.round((status.processed / status.total) * 100) : 0;
  const done = !status.running && status.finishedAt && !status.error;

  return (
    <div className="space-y-6">
      <h1 className="text-white text-2xl font-bold uppercase tracking-wider mb-8">AI SEARCH</h1>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
                <Database className="w-4 h-4" /> Embeddings Stored
              </div>
              <div className="text-[#ff6b6b] text-4xl font-bold">{status.storedCount.toLocaleString()}</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="text-gray-400 text-xs uppercase mb-2">Gemini API Key</div>
              <div className={`text-2xl font-bold flex items-center gap-2 ${status.hasKey ? 'text-green-400' : 'text-red-400'}`}>
                {status.hasKey ? <><CheckCircle2 className="w-6 h-6" /> Configured</> : <><AlertTriangle className="w-6 h-6" /> Missing</>}
              </div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="text-gray-400 text-xs uppercase mb-2">Status</div>
              <div className="text-2xl font-bold text-white">
                {status.running ? 'Running…' : done ? 'Idle (ready)' : status.error ? 'Error' : 'Idle'}
              </div>
            </div>
          </div>

          {/* Control panel */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 space-y-5">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-1">Generate semantic-search embeddings</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Builds vector embeddings for every published destination, festival and dish so the
                  AI assistant and search can find content by meaning, not just keywords. Runs in the
                  background — safe to leave this page. Already-embedded items are skipped unless you
                  enable “re-embed everything”.
                </p>
              </div>
            </div>

            {!status.hasKey && (
              <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Set the <code className="mx-1 px-1.5 py-0.5 rounded bg-black/40">GEMINI_API_KEY</code> environment variable before generating.
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
              <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} disabled={status.running}
                className="w-4 h-4 rounded border-gray-600 bg-black/40 accent-purple-600" />
              Re-embed everything (force — ignores what’s already stored)
            </label>

            <button
              onClick={start}
              disabled={status.running || starting || !status.hasKey}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-poppins font-medium text-sm bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status.running || starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {status.running ? 'Generating…' : starting ? 'Starting…' : 'Generate embeddings'}
            </button>

            {/* Progress */}
            {(status.running || status.processed > 0) && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>{status.processed} / {status.total || '—'} processed</span>
                  <span className="flex items-center gap-3">
                    <span className="text-green-400">ok: {status.ok}</span>
                    <span className={status.failed > 0 ? 'text-red-400' : 'text-gray-500'}>failed: {status.failed}</span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-black/50 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-[#ff6b6b] transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}

            {status.error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {status.error}
              </div>
            )}
            {done && (
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Done — {status.ok} embedded{status.failed > 0 ? `, ${status.failed} failed` : ''}.
              </div>
            )}

            <button onClick={fetchStatus} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </>
      )}
    </div>
  );
}
