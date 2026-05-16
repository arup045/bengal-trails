import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE, authFetch } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  wishlist?: string[];
  savedItineraries?: any[];
  role?: 'user' | 'admin' | 'moderator';
  avatar_url?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signUp: (email: string, password: string, name: string, consent?: { acceptedTerms: boolean; acceptedPrivacy: boolean; marketingOptIn?: boolean }) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// authFetch now imported from utils/api (handles token refresh automatically)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('access_token');
      if (!token || token.startsWith('admin-access-token-')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setLoading(false);
        return;
      }
      try {
        const res = await authFetch('/auth/user');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const signUp = async (email: string, password: string, name: string, consent?: any) => {
    try {
      const res = await authFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, consent }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Signup failed' };
      return { success: true };
    } catch {
      return { success: false, error: 'Network error during signup' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await authFetch('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Sign in failed' };
      localStorage.setItem('access_token', data.session.accessToken || data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refreshToken || data.session.refresh_token);
      setAccessToken(data.session.accessToken || data.session.access_token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Network error during sign in' };
    }
  };

  const signInWithGoogle = async () => {
    // Full-page redirect to the backend OAuth route. The backend handles the
    // Google handshake and redirects back to /#/auth-callback?access_token=...
    window.location.href = `${API_BASE}/auth/google`;
    return { success: true };
  };

  const signInWithFacebook = async () => {
    window.location.href = `${API_BASE}/auth/facebook`;
    return { success: true };
  };
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('admin_session');
      setAccessToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const res = await authFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(updates) });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Update failed' };
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await authFetch('/auth/account', { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: data.error || 'Delete failed' };
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setAccessToken(null);
      setUser(null);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authFetch('/auth/user');
      if (res.ok) { const data = await res.json(); setUser(data.user); }
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, isAdmin, signIn, signUp, signInWithGoogle, signInWithFacebook, signOut, updateProfile, deleteAccount, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
