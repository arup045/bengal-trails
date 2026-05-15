// Frontend Sentry — only initializes if VITE_SENTRY_DSN env var is set.
// This way the codebase doesn't crash for users running locally without Sentry,
// and production gets full error reporting once you set the env var on Netlify.

let initialized = false;

export async function initSentryIfConfigured() {
  if (initialized) return;
  const dsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined)?.trim();
  if (!dsn) {
    // Quiet in production, noisy in dev
    if (import.meta.env.DEV) {
      console.info('ℹ️  Sentry not configured (set VITE_SENTRY_DSN in Netlify env to enable)');
    }
    return;
  }

  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'production',
      // Capture 10% of transactions for perf monitoring in prod, none in dev
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
      // Capture replay of sessions that crash, sample a fraction otherwise
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      beforeSend: (event) => {
        // Don't report cancelled fetches, etc.
        if (event.exception?.values?.[0]?.value?.includes('AbortError')) return null;
        return event;
      },
    });
    initialized = true;
    console.info('✅ Sentry monitoring active');
  } catch (err) {
    // Sentry package may not be installed yet — fail silently
    console.warn('Sentry init skipped:', (err as Error)?.message);
  }
}
