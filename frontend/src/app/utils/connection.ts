// connection.ts — tracks API reachability so the app can show ONE calm global
// banner ("reconnecting…") instead of scary per-page errors, and auto-recover
// when the free-tier backend wakes. Components call setApiDown/setApiUp; the
// ConnectionBanner subscribes and polls /health to clear itself.

type Listener = (down: boolean) => void;

let _down = false;
const listeners = new Set<Listener>();

export function isApiDown(): boolean { return _down; }

export function subscribeApi(cb: Listener): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function emit() { listeners.forEach((l) => { try { l(_down); } catch { /* ignore */ } }); }

export function setApiDown(): void { if (!_down) { _down = true; emit(); } }
export function setApiUp():   void { if (_down)  { _down = false; emit(); } }
