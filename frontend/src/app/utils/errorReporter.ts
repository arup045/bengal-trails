/**
 * Lightweight error reporter — POSTs errors to VITE_ERROR_REPORT_URL if set
 * (e.g. a Sentry "tunnel" / store endpoint, a Logflare HTTP source, your own
 * backend). No-op otherwise so dev and unconfigured prod stay quiet.
 */

const ENDPOINT = (import.meta.env.VITE_ERROR_REPORT_URL as string | undefined) ?? '';
const RELEASE = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? 'dev';

export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (!ENDPOINT) return;
  try {
    const payload = {
      release: RELEASE,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
    };
    // Use sendBeacon when available so it survives unload
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, body);
    } else {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // never let the reporter itself throw
  }
}

export function installGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', (e) => {
    reportError(e.error ?? e.message, { type: 'window.error' });
  });
  window.addEventListener('unhandledrejection', (e) => {
    reportError(e.reason, { type: 'unhandledrejection' });
  });
}
