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

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    setIsLoading(true);
    
    if (user && accessToken) {
      // User is logged in - fetch from database
      try {
        const response = await fetch(
          `${API_BASE}/wishlist`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setWishlist(data.wishlist || []);
          
          // Also update localStorage
          localStorage.setItem('wishlist', JSON.stringify(data.wishlist || []));
        } else {
          // Fallback to localStorage
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading wishlist from database:', error);
        loadFromLocalStorage();
      }
    } else {
      // Not logged in - use localStorage
      loadFromLocalStorage();
    }
    
    setIsLoading(false);
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  };

  const syncToDatabase = async (localWishlist: WishlistItem[]) => {
    if (!user || !accessToken) return;

    setIsSyncing(true);
    
    try {
      const response = await fetch(
        `${API_BASE}/wishlist/sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ localWishlist }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist);
        localStorage.setItem('wishlist', JSON.stringify(data.wishlist));
      }
    } catch (error) {
      console.error('Error syncing wishlist:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addToWishlist = async (place: WishlistItem) => {
    const newItem = {
      ...place,
      addedAt: new Date().toISOString()
    };

    if (user && accessToken) {
      // Add to database
      try {
        const response = await fetch(
          `${API_BASE}/wishlist`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ place: newItem }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setWishlist(data.wishlist);
          localStorage.setItem('wishlist', JSON.stringify(data.wishlist));
          return true;
        }
      } catch (error) {
        console.error('Error adding to wishlist:', error);
      }
    }
    
    // Fallback to localStorage
    const updated = [...wishlist, newItem];
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    return true;
  };

  const removeFromWishlist = async (slug: string) => {
    if (user && accessToken) {
      // Remove from database
      try {
        const response = await fetch(
          `${API_BASE}/wishlist/${slug}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setWishlist(data.wishlist);
          localStorage.setItem('wishlist', JSON.stringify(data.wishlist));
          return true;
        }
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    }
    
    // Fallback to localStorage
    const updated = wishlist.filter(item => item.slug !== slug);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    return true;
  };

  const clearWishlist = async () => {
    if (user && accessToken) {
      // Clear in database
      try {
        const response = await fetch(
          `${API_BASE}/wishlist`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          setWishlist([]);
          localStorage.setItem('wishlist', JSON.stringify([]));
          return true;
        }
      } catch (error) {
        console.error('Error clearing wishlist:', error);
      }
    }
    
    // Fallback to localStorage
    setWishlist([]);
    localStorage.setItem('wishlist', JSON.stringify([]));
    return true;
  };

  const isInWishlist = (slug: string) => {
    return wishlist.some(item => item.slug === slug);
  };

  return {
    wishlist,
    isLoading,
    isSyncing,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    syncToDatabase,
    refreshWishlist: loadWishlist
  };
}
