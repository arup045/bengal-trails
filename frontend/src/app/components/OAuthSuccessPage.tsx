import { useEffect } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { API_BASE } from '../utils/api';

export function OAuthSuccessPage() {
  useEffect(() => {
    const handleOAuth = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.split('?')[1] || '');
      const token = params.get('token');

      if (!token) {
        window.location.hash = '#/signin?error=No_token_received';
        return;
      }

      // Save token and fetch user
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', token);

      try {
        const res = await fetch(`${API_BASE}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === 'admin') {
            window.location.hash = '#/admin';
          } else {
            window.location.hash = '#/';
          }
          // Force reload to update AuthContext
          setTimeout(() => window.location.reload(), 300);
        } else {
          window.location.hash = '#/signin?error=Failed_to_fetch_user';
        }
      } catch {
        window.location.hash = '#/signin?error=Network_error';
      }
    };

    handleOAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Signing you in...</h1>
        <p className="text-gray-600 mb-6">Welcome back! Redirecting you now.</p>
        <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
      </div>
    </div>
  );
}
