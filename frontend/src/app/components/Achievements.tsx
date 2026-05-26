import { useEffect, useState } from 'react';
import { authFetch } from '../utils/api';

// Traveller stats + earned badges — computed from the user's REAL activity
// (reviews written, places wishlisted, trips planned). No fake numbers.
export function Achievements() {
  const [stats, setStats] = useState({ reviews: 0, trips: 0, wishlist: 0 });

  useEffect(() => {
    let alive = true;
    let wl = 0;
    try { wl = (JSON.parse(localStorage.getItem('wishlist') || '[]') as unknown[]).length; } catch { /* ignore */ }
    Promise.all([
      authFetch('/reviews/user/me').then(r => (r.ok ? r.json() : { reviews: [] })).catch(() => ({ reviews: [] })),
      authFetch('/trip-plans').then(r => (r.ok ? r.json() : {})).catch(() => ({})),
    ]).then(([rv, tp]: any[]) => {
      if (!alive) return;
      const trips = (tp.tripPlans || tp.trips || tp.plans || []).length;
      setStats({ reviews: (rv.reviews || []).length, trips, wishlist: wl });
    });
    return () => { alive = false; };
  }, []);

  const badges = [
    { earned: stats.reviews >= 1, icon: '✍️', label: 'First Review',     hint: 'Write a review' },
    { earned: stats.reviews >= 5, icon: '🌟', label: 'Top Reviewer',     hint: 'Write 5 reviews' },
    { earned: stats.wishlist >= 1, icon: '❤️', label: 'Dreamer',          hint: 'Save a place' },
    { earned: stats.wishlist >= 5, icon: '🧭', label: 'Wishlist Curator', hint: 'Save 5 places' },
    { earned: stats.trips >= 1, icon: '🗺️', label: 'Trip Planner',      hint: 'Plan a trip' },
    { earned: stats.trips >= 3, icon: '🏆', label: 'Bengal Explorer',    hint: 'Plan 3 trips' },
  ];
  const earnedCount = badges.filter(b => b.earned).length;

  const Stat = ({ n, label }: { n: number; label: string }) => (
    <div className="text-center">
      <div className="font-poppins text-2xl font-bold text-purple-700">{n}</div>
      <div className="font-poppins text-xs text-gray-500">{label}</div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-poppins text-xl font-semibold text-slate-900">Your travel stats</h2>
        <span className="font-poppins text-sm font-semibold text-purple-600 bg-purple-50 rounded-full px-3 py-1">
          {earnedCount}/{badges.length} badges
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 bg-gray-50 rounded-2xl py-4">
        <Stat n={stats.reviews} label="Reviews" />
        <Stat n={stats.wishlist} label="Wishlisted" />
        <Stat n={stats.trips} label="Trips" />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {badges.map((b) => (
          <div key={b.label} title={b.earned ? `Earned: ${b.label}` : `Locked — ${b.hint}`}
            className={`flex flex-col items-center text-center rounded-2xl p-3 border transition-all ${b.earned ? 'bg-gradient-to-br from-purple-50 to-orange-50 border-purple-100' : 'bg-gray-50 border-gray-100 opacity-50 grayscale'}`}>
            <span className="text-2xl mb-1">{b.icon}</span>
            <span className="font-poppins text-[11px] font-medium text-slate-700 leading-tight">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
