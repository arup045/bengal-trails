import { API_BASE } from './api';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface WishlistItem {
  slug: string;
  title: string;
  category: string;
  region: string;
  image: string;
  description: string;
  price?: number;
  addedAt?: string;
}

export function useWishlistSync() {
  const { user, accessToken } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => { loadWishlist(); }, [user]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  });

  const loadWishlist = async () => {
    setIsLoading(true);
    if (user && accessToken) {
      try {
        const res = await fetch(`${API_BASE}/wishlist`, { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          // Backend returns [{ slug, added_at }] - merge with localStorage for full item data
          const slugRows: { slug: string }[] = data.wishlist || [];
          const localRaw = localStorage.getItem('wishlist');
          const localItems: WishlistItem[] = localRaw ? JSON.parse(localRaw) : [];
          // Map slugs back to full items using local cache
          const merged = slugRows.map(r => {
            const local = localItems.find(l => l.slug === r.slug);
            return local || { slug: r.slug, title: r.slug, category: '', region: '', image: '', description: '' };
          });
          setWishlist(merged);
          localStorage.setItem('wishlist', JSON.stringify(merged));
          setIsLoading(false);
          return;
        }
      } catch { /* fall through to localStorage */ }
    }
    loadFromLocalStorage();
    setIsLoading(false);
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('wishlist');
    if (saved) setWishlist(JSON.parse(saved));
  };

  // OPTIMISTIC: update UI + localStorage instantly, then sync to the server in
  // the background. Roll back only if the server call fails — so the heart never
  // feels laggy, even on a free-tier cold start.
  const persist = (items: WishlistItem[]) => {
    setWishlist(items);
    try { localStorage.setItem('wishlist', JSON.stringify(items)); } catch { /* quota */ }
  };

  const addToWishlist = async (place: WishlistItem) => {
    const newItem = { ...place, addedAt: new Date().toISOString() };
    const prev = wishlist;
    persist([...wishlist.filter(i => i.slug !== place.slug), newItem]); // optimistic
    if (user && accessToken) {
      try {
        const res = await fetch(`${API_BASE}/wishlist`, {
          method: 'POST', headers: authHeaders(), body: JSON.stringify({ slug: place.slug }),
        });
        if (!res.ok) throw new Error('save failed');
      } catch {
        persist(prev); // rollback
        return false;
      }
    }
    return true;
  };

  const removeFromWishlist = async (slug: string) => {
    const prev = wishlist;
    persist(wishlist.filter(i => i.slug !== slug)); // optimistic
    if (user && accessToken) {
      try {
        const res = await fetch(`${API_BASE}/wishlist/${slug}`, { method: 'DELETE', headers: authHeaders() });
        if (!res.ok) throw new Error('remove failed');
      } catch {
        persist(prev); // rollback
        return false;
      }
    }
    return true;
  };

  const clearWishlist = async () => {
    if (user && accessToken) {
      try {
        // Backend DELETE /wishlist (clear all) - added in wishlist.js fix
        const res = await fetch(`${API_BASE}/wishlist`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        if (res.ok) {
          setWishlist([]);
          localStorage.setItem('wishlist', JSON.stringify([]));
          return true;
        }
      } catch { /* fall through */ }
    }
    setWishlist([]);
    localStorage.setItem('wishlist', JSON.stringify([]));
    return true;
  };

  const syncToDatabase = async (localWishlist: WishlistItem[]) => {
    if (!user || !accessToken) return;
    setIsSyncing(true);
    try {
      // Backend expects { slugs: string[] }
      const res = await fetch(`${API_BASE}/wishlist/sync`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ slugs: localWishlist.map(i => i.slug) }),
      });
      if (res.ok) {
        const data = await res.json();
        // data.wishlist = [{ slug, added_at }]
        const slugRows: { slug: string }[] = data.wishlist || [];
        const merged = slugRows.map(r => {
          const local = localWishlist.find(l => l.slug === r.slug);
          return local || { slug: r.slug, title: r.slug, category: '', region: '', image: '', description: '' };
        });
        setWishlist(merged);
        localStorage.setItem('wishlist', JSON.stringify(merged));
      }
    } catch { /* ignore */ } finally { setIsSyncing(false); }
  };

  return {
    wishlist, isLoading, isSyncing,
    addToWishlist, removeFromWishlist, clearWishlist,
    isInWishlist: (slug: string) => wishlist.some(i => i.slug === slug),
    syncToDatabase,
    refreshWishlist: loadWishlist,
  };
}
