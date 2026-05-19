import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

import { useAuth } from '../contexts/AuthContext';

/**
 * Handles the redirect back from the backend OAuth flow.
 *
 * Backend redirects to: /#/oauth-success?token=<access_token>
 * The refresh token is sent separately as an httpOnly cookie.
 *
 * This component:
 *   1. Reads access_token from the URL
 *   2. Stores it in localStorage (same keys AuthContext uses)
 *   3. Calls refreshUser() so AuthContext picks up the logged-in user
 *   4. Redirects to /admin (if admin) or / (everyone else)
 */
export function OAuthSuccessPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { setSessionFromToken } = useAuth();

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        // Parse ?token=... from the hash
        const hash = window.location.hash;
        const queryStart = hash.indexOf('?');
        if (queryStart === -1) {
          throw new Error('No token in URL');
        }
        const params = new URLSearchParams(hash.slice(queryStart + 1));
        const token = params.get('token') || params.get('access_token');
        if (!token) {
          throw new Error('No token in URL');
        }

        // SECURITY: strip the token from the URL bar immediately so it doesn't
        // sit in browser history / get copy-pasted / leak via screenshots or
        // session-replay tools. Replace state silently — no navigation event.
        try {
          history.replaceState(null, '', '#/oauth-success');
        } catch { /* non-fatal */ }

        // Store in memory via AuthContext (no localStorage — security upgrade).
        // setSessionFromToken stores the token in the module-level variable in api.ts
        // and fetches the user so AuthContext has the correct user object.
        await setSessionFromToken(token);
        const user = await import('../utils/api').then(m =>
          fetch(`${m.API_BASE}/auth/user`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          }).then(r => r.ok ? r.json() : null)
        );
        const isAdmin = user?.user?.role === 'admin';

        setStatus('success');

        // Navigate after a brief delay so the user sees the success state
        setTimeout(() => {
          window.location.hash = isAdmin ? '#/admin' : '#/';
        }, 800);
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setErrorMessage(err?.message || 'Sign-in failed');
        setTimeout(() => {
          window.location.hash = '#/signin?error=oauth_callback_failed';
        }, 2000);
      }
    };

    handleOAuth();
    // We deliberately run this once on mount; refreshUser changes are fine to ignore
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
      >
        {status === 'processing' && (
          <>
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Signing you in…</h2>
            <p className="text-gray-600">Verifying your account with Bengal Trails.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Bengal Trails!</h2>
            <p className="text-gray-600">Taking you home…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign-in failed</h2>
            <p className="text-gray-600 mb-2">{errorMessage}</p>
            <p className="text-sm text-gray-500">Redirecting back to the sign-in page…</p>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default OAuthSuccessPage;
