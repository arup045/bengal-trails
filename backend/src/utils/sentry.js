// Sentry error monitoring — set SENTRY_DSN in .env to enable
// Free tier: 5,000 errors/month at sentry.io

let Sentry = null;

function initSentry(app) {
  if (!process.env.SENTRY_DSN) {
    console.log('ℹ️  Sentry not configured (set SENTRY_DSN to enable)');
    return null;
  }

  try {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
      beforeSend: (event) => {
        // Don't send 4xx errors — those are expected
        if (event.contexts?.response?.status_code < 500) return null;
        return event;
      },
    });

    console.log('✅ Sentry monitoring active');
    return Sentry;
  } catch (err) {
    console.error('Failed to init Sentry:', err.message);
    return null;
  }
}

function sentryErrorHandler() {
  return (err, req, res, next) => {
    if (Sentry && (err.statusCode >= 500 || !err.statusCode)) {
      Sentry.captureException(err, {
        user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
        tags: { route: req.path, method: req.method },
      });
    }
    next(err);
  };
}

module.exports = { initSentry, sentryErrorHandler };
