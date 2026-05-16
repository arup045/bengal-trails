import { API_BASE } from './api';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RecentlyViewedItem {
  slug: string;
  title: string;
  image: string;
  category: string;
  region: string;
  viewedAt: string;
}

export function useRecentlyViewed() {
  const { user, accessToken } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recently viewed on mount
  useEffect(() => {
    loadRecentlyViewed();
  }, [user]);

  const loadRecentlyViewed = async () => {
    setIsLoading(true);
    
    if (user && accessToken) {
      // User is logged in - fetch from database
      try {
        const response = await fetch(
          `${API_BASE}/recently-viewed`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setRecentlyViewed(data.recentlyViewed || []);
          
          // Also update localStorage
          localStorage.setItem('recentlyViewed', JSON.stringify(data.recentlyViewed || []));
        } else {
          // Fallback to localStorage
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading recently viewed from database:', error);
        loadFromLocalStorage();
      }
    } else {
      // Not logged in - use localStorage
      loadFromLocalStorage();
    }
    
    setIsLoading(false);
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    }
  };

  const addToRecentlyViewed = async (item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    const newItem = {
      ...item,
      viewedAt: new Date().toISOString()
    };

    if (user && accessToken) {
      // Add to database
      try {
        const response = await fetch(
          `${API_BASE}/recently-viewed`,
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
          setRecentlyViewed(data.recentlyViewed);
          localStorage.setItem('recentlyViewed', JSON.stringify(data.recentlyViewed));
          return;
        }
      } catch (error) {
        console.error('Error adding to recently viewed:', error);
      }
    }
    
    // Fallback to localStorage
    let updated = [newItem];
    const existing = recentlyViewed.filter(rv => rv.slug !== item.slug);
    updated = [...updated, ...existing].slice(0, 20); // Keep only last 20
    
    setRecentlyViewed(updated);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  };

  return {
    recentlyViewed,
    isLoading,
    addToRecentlyViewed,
    refreshRecentlyViewed: loadRecentlyViewed
  };
}
