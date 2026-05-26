import { useEffect, useState } from 'react';
import { MapPin, Calendar, Star, Loader2, UserX, Share2, Award, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '../utils/api';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PublicReview {
  id: string;
  destinationSlug: string;
  destinationTitle?: string;
  destinationImage?: string;
  rating: number;
  title?: string;
  content: string;
  photos?: string[];
  helpfulCount?: number;
  createdAt: string;
}
interface PublicProfile {
  profile: { id: string; name: string; avatarUrl?: string | null; location?: string | null; bio?: string | null; memberSince: string };
  stats: { reviews: number; places: number; helpfulVotes: number; avgRating: number };
  badges: { earned: boolean; icon: string; label: string }[];
  reviews: PublicReview[];
}

export function PublicProfilePage({ userId }: { userId: string }) {
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    fetch(`${API_BASE}/users/${userId}/public`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (alive) { setData(d); setLoading(false); } })
      .catch(() => { if (alive) { setError(true); setLoading(false); } });
    return () => { alive = false; };
  }, [userId]);

  const shareProfile = async () => {
    const url = `${window.location.origin}/u/${userId}`;
    try {
      if (navigator.share) { await navigator.share({ title: data?.profile.name || 'Traveller profile', url }); return; }
    } catch { /* cancelled */ }
    try { await navigator.clipboard.writeText(url); toast.success('Profile link copied!'); }
    catch { toast.error('Could not copy link'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <UserX className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="font-poppins text-2xl font-semibold text-slate-900 mb-2">Profile not found</h1>
        <p className="font-poppins text-gray-500 mb-6">This traveller's profile doesn't exist or is no longer available.</p>
        <a href="/explore" className="px-6 py-3 bg-purple-600 text-white rounded-full font-poppins font-medium hover:bg-purple-700 transition">
          Explore West Bengal
        </a>
      </div>
    );
  }

  const { profile, stats, badges, reviews } = data;
  const memberSince = profile.memberSince ? new Date(profile.memberSince).getFullYear() : null;
  const initials = (profile.name || 'T').trim().charAt(0).toUpperCase();
  const earnedBadges = badges.filter((b) => b.earned);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover + identity */}
      <div className="relative bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-28 pb-16 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
          <div className="w-28 h-28 rounded-full ring-4 ring-white/30 overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
            {profile.avatarUrl ? (
              <ImageWithFallback src={profile.avatarUrl} alt={profile.name} optimizeWidth={200} className="w-full h-full object-cover" />
            ) : (
              <span className="font-poppins text-4xl font-bold text-white/90">{initials}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-poppins text-3xl sm:text-4xl font-bold">{profile.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-white/80 font-poppins text-sm">
              {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</span>}
              {memberSince && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Member since {memberSince}</span>}
            </div>
            {profile.bio && <p className="mt-3 text-white/85 font-poppins text-sm max-w-xl leading-relaxed">{profile.bio}</p>}
          </div>
          <button onClick={shareProfile}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2.5 rounded-full font-poppins text-sm font-medium transition shrink-0">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 -mt-16 relative z-10 mb-8">
          {[
            { n: stats.reviews, label: 'Reviews' },
            { n: stats.places, label: 'Places visited' },
            { n: stats.helpfulVotes, label: 'Helpful votes' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 py-5 text-center">
              <div className="font-poppins text-2xl font-bold text-purple-700">{s.n}</div>
              <div className="font-poppins text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="font-poppins text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" /> Badges earned
            </h2>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map((b) => (
                <div key={b.label} className="flex items-center gap-2 bg-gradient-to-br from-purple-50 to-orange-50 border border-purple-100 rounded-full px-4 py-2">
                  <span className="text-lg">{b.icon}</span>
                  <span className="font-poppins text-sm font-medium text-slate-700">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <h2 className="font-poppins text-lg font-semibold text-slate-900 mb-4">
          Reviews {stats.reviews > 0 && <span className="text-gray-400 font-normal">({stats.reviews})</span>}
        </h2>
        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-poppins text-gray-500">No reviews yet — this traveller hasn't shared their experiences.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rv) => (
              <div key={rv.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <a href={`/explore/${rv.destinationSlug}`} className="flex gap-4 p-4 hover:bg-gray-50 transition group">
                  {rv.destinationImage && (
                    <ImageWithFallback src={rv.destinationImage} alt={rv.destinationTitle || ''} optimizeWidth={160}
                      className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-poppins font-semibold text-slate-900 truncate group-hover:text-purple-700 transition">
                        {rv.destinationTitle || rv.destinationSlug}
                      </h3>
                      <span className="shrink-0 flex items-center gap-0.5 text-amber-500 font-poppins text-sm font-semibold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />{rv.rating}
                      </span>
                    </div>
                    {rv.title && <p className="font-poppins text-sm font-medium text-slate-700 mt-1">{rv.title}</p>}
                    <p className="font-poppins text-sm text-gray-600 mt-1 line-clamp-3 whitespace-pre-line">{rv.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 font-poppins">
                      <span>{new Date(rv.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                      {(rv.helpfulCount || 0) > 0 && (
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{rv.helpfulCount} helpful</span>
                      )}
                    </div>
                  </div>
                </a>
                {Array.isArray(rv.photos) && rv.photos.length > 0 && (
                  <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
                    {rv.photos.slice(0, 6).map((url, i) => (
                      <ImageWithFallback key={i} src={url} alt="" optimizeWidth={240}
                        className="w-20 h-20 rounded-lg object-cover shrink-0" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfilePage;
