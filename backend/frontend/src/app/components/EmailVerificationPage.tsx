import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '../utils/api';

export function EmailVerificationPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.split('?')[1] || '');
        const token = params.get('token') || params.get('access_token');

        if (!token) {
          setVerificationStatus('error');
          setErrorMessage('No verification token found in the link.');
          return;
        }

        const res = await fetch(`${API_BASE}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setVerificationStatus('success');
          toast.success('Email verified successfully!');
          setTimeout(() => { window.location.hash = '#/signin'; }, 3000);
        } else {
          setVerificationStatus('error');
          setErrorMessage(data.error || 'Verification failed. The link may be invalid or expired.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setErrorMessage('An unexpected error occurred');
      }
    };

    verifyEmail();
  }, []);

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Verifying Email...</h1>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verified! 🎉</h1>
          <p className="text-gray-600 mb-8">Your email has been verified. You can now sign in and start exploring West Bengal!</p>
          <div className="space-y-3">
            <button onClick={() => window.location.hash = '#/signin'} className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors">
              Continue to Sign In
            </button>
            <button onClick={() => window.location.hash = '#/'} className="w-full bg-gray-100 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors">
              Go to Home
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-6">Redirecting to sign in page in 3 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h1>
        <p className="text-gray-600 mb-2">{errorMessage || "We couldn't verify your email address."}</p>
        <p className="text-gray-600 mb-8">The verification link may have expired or is invalid.</p>
        <div className="space-y-3">
          <button onClick={() => window.location.hash = '#/signin'} className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors">
            Back to Sign In
          </button>
          <button onClick={() => window.location.hash = '#/'} className="w-full bg-gray-100 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors">
            Go to Home
          </button>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Need help?</strong> Try signing up again or contact support if the problem persists.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
