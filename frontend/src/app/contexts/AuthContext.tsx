import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE, authFetch, setToken, clearToken, tryRefresh } from '../utils/api';

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
  signIn:           (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signUp:           (email: string, password: string, name: string, consent?: any) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle:   () => Promise<{ success: boolean; error?: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  signOut:          () => Promise<void>;
  updateProfile:    (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  deleteAccount:    () => Promise<{ success: boolean; error?: string }>;
  refreshUser:      () => Promise<void>;
  // Called by OAuthSuccessPage after reading the token from the URL hash
  setSessionFromToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeUser = (u: any): User => ({
  id:               u.id,
  email:            u.email,
  name:             u.name,
  createdAt:        u.created_at || u.createdAt || '',
  wishlist:         u.wishlist,
  savedItineraries: u.savedItineraries,
  role:             u.role,
  avatar_url:       u.avatar_url,
  phone:            u.phone,
  location:         u.location,
  bio:              u.bio,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,        setUser]        = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(true);

  const isAdmin = user?.role === 'admin';

  // ── On mount: silently restore session from the httpOnly refresh cookie ─────
  // The access token is never persisted, so on every page load we ask the backend
  // to issue a new one using the long-lived httpOnly bt_refresh cookie.
  useEffect(() => {
    const restoreSession = async () => {
      const token = await tryRefresh();
      if (!token) { setLoading(false); return; }

      try {
        const res = await authFetch('/auth/user');
        if (res.ok) {
          const data = await res.json();
          setToken(token);
          setAccessToken(token);
          setUser(safeUser(data.user));
        } else {
          clearToken();
          setAccessToken(null);
        }
      } catch {
        clearToken();
        setAccessToken(null);
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  // ── signIn ────────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signin`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',   // ← receive the httpOnly refresh cookie
        body:        JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Sign in failed' };

      const token = data.session?.access_token || data.session?.accessToken;
      setToken(token);
      setAccessToken(token);
      setUser(safeUser(data.user));
      return { success: true, user: safeUser(data.user) };
    } catch {
      return { success: false, error: 'Network error during sign in' };
    }
  };

  // ── signUp ────────────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string, name: string, consent?: any) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ email, password, name, consent }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Signup failed' };
      return { success: true };
    } catch {
      return { success: false, error: 'Network error during signup' };
    }
  };

  // ── OAuth ─────────────────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (import.meta.env.PROD && API_BASE.includes('localhost')) {
      return { success: false, error: 'Google sign-in is not configured. Please contact support.' };
    }
    window.location.href = `${API_BASE}/auth/google`;
    return { success: true };
  };

  const signInWithFacebook = async () => {
    if (import.meta.env.PROD && API_BASE.includes('localhost')) {
      return { success: false, error: 'Facebook sign-in is not configured. Please contact support.' };
    }
    window.location.href = `${API_BASE}/auth/facebook`;
    return { success: true };
  };

  // ── Called by OAuthSuccessPage after reading token from URL hash ──────────────
  const setSessionFromToken = async (token: string) => {
    setToken(token);
    setAccessToken(token);
    try {
      const res = await authFetch('/auth/user');
      if (res.ok) {
        const data = await res.json();
        setUser(safeUser(data.user));
      }
    } catch { /* non-fatal */ }
  };

  // ── signOut ───────────────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      await authFetch('/auth/signout', { method: 'POST' });
    } catch { /* ignore — cookie cleared server-side */ } finally {
      clearToken();
      setAccessToken(null);
      setUser(null);
      // Clean up any leftover legacy localStorage keys
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('admin_session');
    }
  };

  // ── updateProfile ─────────────────────────────────────────────────────────────
  const updateProfile = async (updates: Partial<User>) => {
    try {
      const res = await authFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(updates) });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Update failed' };
      setUser(safeUser(data.user));
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  // ── deleteAccount ─────────────────────────────────────────────────────────────
  const deleteAccount = async () => {
    try {
      const res = await authFetch('/auth/account', { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: data.error || 'Delete failed' };
      clearToken();
      setAccessToken(null);
      setUser(null);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  // ── refreshUser ───────────────────────────────────────────────────────────────
  const refreshUser = async () => {
    try {
      const res = await authFetch('/auth/user');
      if (res.ok) { const data = await res.json(); setUser(safeUser(data.user)); }
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{
      user, accessToken, loading, isAdmin,
      signIn, signUp, signInWithGoogle, signInWithFacebook,
      signOut, updateProfile, deleteAccount, refreshUser, setSessionFromToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
