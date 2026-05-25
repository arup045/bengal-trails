import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Calendar, MapPin, Heart, Phone,
  Edit2, Save, X, Camera, Globe, Mountain, Sparkles,
  CheckCircle2, Loader2, LogOut, Shield, Trash2,
  Star, BookOpen, Compass, ChevronRight, Upload, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadImage, authFetch } from '../utils/api';

const INTEREST_OPTIONS = [
  { value: 'Hills & Tea',        icon: Mountain,  color: 'bg-blue-50   text-blue-600   border-blue-200'   },
  { value: 'Heritage & History', icon: BookOpen,  color: 'bg-amber-50  text-amber-600  border-amber-200'  },
  { value: 'Festivals & Culture',icon: Sparkles,  color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { value: 'Beaches & Seasides', icon: Globe,     color: 'bg-teal-50   text-teal-600   border-teal-200'   },
  { value: 'Wildlife & Nature',  icon: Heart,     color: 'bg-green-50  text-green-600  border-green-200'  },
  { value: 'City & Food',        icon: Compass,   color: 'bg-orange-50 text-orange-600 border-orange-200' },
];

const BUDGET_OPTIONS = [
  { value: 'budget',  label: 'Budget',  sub: 'Under ₹2,000/day',  color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'mid',     label: 'Mid-range', sub: '₹2k–5k/day',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'premium', label: 'Premium', sub: '₹5,000+/day',      color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const TRIP_TYPES = [
  { value: 'solo',    label: '🧍 Solo Explorer' },
  { value: 'couple',  label: '👫 Couple Getaway' },
  { value: 'family',  label: '👨‍👩‍👧 Family Trip' },
  { value: 'group',   label: '👥 Group Travel' },
];

function ProfileCompletion({ user }: { user: any }) {
  const fields = [
    { label: 'Name',      done: !!user?.name },
    { label: 'Phone',     done: !!user?.phone },
    { label: 'Location',  done: !!user?.location },
    { label: 'Bio',       done: !!user?.bio },
    { label: 'Interests', done: (user?.interests?.length || 0) > 0 },
    { label: 'Avatar',    done: !!user?.avatar_url },
  ];
  const pct = Math.round((fields.filter(f => f.done).length / fields.length) * 100);
  if (pct === 100) return null;
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="font-poppins text-sm font-semibold text-slate-800">Complete your profile</p>
        <span className="font-poppins text-sm font-bold text-purple-600">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-purple-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {fields.filter(f => !f.done).map(f => (
          <span key={f.label} className="text-xs font-poppins text-purple-600 bg-white border border-purple-200 rounded-full px-2.5 py-1">
            + {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function UserProfilePage() {
  const { user, loading: authLoading, updateProfile, signOut, deleteAccount, refreshUser } = useAuth();
  const [isEditing,       setIsEditing]       = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [activeTab,       setActiveTab]       = useState<'profile' | 'trips' | 'reviews' | 'settings'>('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm,   setDeleteConfirm]   = useState('');
  const [bookings,        setBookings]        = useState<any[]>([]);
  const [tripPlans,       setTripPlans]       = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [myReviews,       setMyReviews]       = useState<any[]>([]);
  const [reviewsLoading,  setReviewsLoading]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name:      user?.name      || '',
    phone:     user?.phone     || '',
    location:  user?.location  || '',
    bio:       user?.bio       || '',
    country:   user?.country   || '',
    interests: (user?.interests as string[]) || [],
    budget:    user?.budget    || '',
    tripType:  user?.tripType  || '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name:      user.name      || '',
        phone:     user.phone     || '',
        location:  user.location  || '',
        bio:       user.bio       || '',
        country:   user.country   || '',
        interests: (user.interests as string[]) || [],
        budget:    user.budget    || '',
        tripType:  user.tripType  || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'trips') {
      setBookingsLoading(true);
      Promise.allSettled([
        authFetch('/bookings').then(r => r.ok ? r.json() : { bookings: [] }),
        authFetch('/trip-plans').then(r => r.ok ? r.json() : { tripPlans: [] }),
      ])
        .then(([bk, tp]) => {
          setBookings(bk.status === 'fulfilled' ? (bk.value.bookings || []) : []);
          const plans = tp.status === 'fulfilled' ? (tp.value.tripPlans || tp.value.trip_plans || tp.value.plans || []) : [];
          setTripPlans(Array.isArray(plans) ? plans : []);
        })
        .finally(() => setBookingsLoading(false));
    }
    if (activeTab === 'reviews') {
      loadMyReviews();
    }
  }, [activeTab]);

  const loadMyReviews = () => {
    setReviewsLoading(true);
    authFetch('/reviews/user/me')
      .then(r => r.ok ? r.json() : { reviews: [] })
      .then(d => setMyReviews(d.reviews || []))
      .catch(() => setMyReviews([]))
      .finally(() => setReviewsLoading(false));
  };

  // Listen for global review changes (when user posts/edits/deletes a review
  // from a place detail page, refresh this list on next visit to the tab).
  useEffect(() => {
    const handler = () => { if (activeTab === 'reviews') loadMyReviews(); };
    window.addEventListener('bt:review-changed', handler);
    return () => window.removeEventListener('bt:review-changed', handler);
  }, [activeTab]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    const r = await authFetch(`/reviews/${reviewId}`, { method: 'DELETE' });
    if (r.ok) {
      toast.success('Review deleted');
      setMyReviews(prev => prev.filter(rv => rv.id !== reviewId));
      // Broadcast so place pages / cards refresh their counts
      window.dispatchEvent(new CustomEvent('bt:review-changed'));
    } else {
      toast.error('Could not delete review');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    const result = await updateProfile({
      name:      form.name,
      phone:     form.phone,
      location:  form.location,
      bio:       form.bio,
      country:   form.country,
      interests: form.interests,
      budget:    form.budget,
      tripType:  form.tripType,
    } as any);
    setLoading(false);
    if (result.success) { toast.success('Profile updated!'); setIsEditing(false); }
    else toast.error(result.error || 'Update failed');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setAvatarUploading(true);
    try {
      const { url } = await uploadImage(file);
      await updateProfile({ avatar_url: url } as any);
      await refreshUser();
      toast.success('Avatar updated!');
    } catch { toast.error('Upload failed'); }
    finally { setAvatarUploading(false); }
  };

  const toggleInterest = (val: string) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(val)
        ? f.interests.filter(i => i !== val)
        : [...f.interests, val],
    }));
  };

  const handleDelete = async () => {
    if (deleteConfirm !== user?.email) { toast.error('Email does not match'); return; }
    const r = await deleteAccount();
    if (r.success) { window.location.hash = '#/'; toast.success('Account deleted'); }
    else toast.error(r.error || 'Failed');
  };

  // While the session is being restored on a page refresh, show a loader instead
  // of briefly flashing the "Sign in" prompt to an already-logged-in user.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="font-poppins text-xl font-semibold text-slate-900 mb-2">Sign in to view your profile</h2>
          <a href="/signin" className="mt-4 inline-block bg-purple-600 text-white px-6 py-3 rounded-full font-poppins text-sm font-medium hover:bg-purple-700 transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">

      {/* ── Profile Header Banner ─────────────────────────────────── */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-2xl">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white font-poppins">
                    {initials}
                  </div>
                )}
              </div>
              <button onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100">
                {avatarUploading ? <Loader2 className="w-4 h-4 text-purple-600 animate-spin" /> : <Camera className="w-4 h-4 text-purple-600" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-poppins text-3xl font-bold">{user.name}</h1>
                {user.role === 'admin' && (
                  <span className="bg-amber-400 text-amber-900 text-xs font-poppins font-bold px-2.5 py-0.5 rounded-full">ADMIN</span>
                )}
              </div>
              <p className="text-purple-300 font-poppins text-sm mt-1">{user.email}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                {user.location && (
                  <span className="flex items-center gap-1.5 text-purple-200 text-sm font-poppins">
                    <MapPin className="w-3.5 h-3.5" /> {user.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-purple-200 text-sm font-poppins">
                  <Calendar className="w-3.5 h-3.5" /> Member since {memberSince}
                </span>
              </div>
              {user.bio && <p className="text-purple-200 font-poppins text-sm mt-3 max-w-lg leading-relaxed">{user.bio}</p>}
            </div>
            {/* Actions */}
            <div className="flex gap-2 sm:self-start">
              <button onClick={() => { setIsEditing(true); setActiveTab('profile'); }}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl font-poppins text-sm transition-colors">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={signOut}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-red-500/20 border border-white/20 text-white px-4 py-2 rounded-xl font-poppins text-sm transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-20 shadow-sm -mt-8 rounded-t-3xl">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-1 pt-2">
            {(['profile', 'trips', 'reviews', 'settings'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 font-poppins text-sm font-medium rounded-t-xl transition-colors capitalize
                  ${activeTab === tab ? 'text-purple-600 border-b-2 border-purple-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab === 'profile' ? '👤 Profile' : tab === 'trips' ? '🗺️ My Trips' : tab === 'reviews' ? '⭐ My Reviews' : '⚙️ Settings'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* ── PROFILE TAB ─────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ProfileCompletion user={user} />

              {isEditing ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-poppins text-xl font-semibold text-slate-900">Edit Profile</h2>
                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Basic Info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: 'name',     label: 'Full Name *',    icon: User,    placeholder: 'Your name',      type: 'text'  },
                      { key: 'phone',    label: 'Phone Number',   icon: Phone,   placeholder: '+91 98765 43210', type: 'tel'   },
                      { key: 'location', label: 'City / Region',  icon: MapPin,  placeholder: 'e.g. Kolkata',   type: 'text'  },
                      { key: 'country',  label: 'Country',        icon: Globe,   placeholder: 'e.g. India',     type: 'text'  },
                    ].map(({ key, label, icon: Icon, placeholder, type }) => (
                      <div key={key}>
                        <label className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                        <div className="relative">
                          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={type}
                            value={(form as any)[key]}
                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">About You</label>
                    <textarea
                      value={form.bio}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      rows={3}
                      maxLength={200}
                      placeholder="Tell fellow travelers a bit about yourself..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 resize-none transition-colors"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{form.bio.length}/200</p>
                  </div>

                  {/* Travel Interests */}
                  <div>
                    <label className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Travel Interests</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {INTEREST_OPTIONS.map(({ value, icon: Icon, color }) => {
                        const active = form.interests.includes(value);
                        return (
                          <button key={value} type="button" onClick={() => toggleInterest(value)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-poppins text-sm transition-all
                              ${active ? color + ' font-medium' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{value}</span>
                            {active && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Travel Budget</label>
                    <div className="grid grid-cols-3 gap-3">
                      {BUDGET_OPTIONS.map(({ value, label, sub, color }) => (
                        <button key={value} type="button" onClick={() => setForm(f => ({ ...f, budget: value }))}
                          className={`p-3 rounded-xl border text-left transition-all ${form.budget === value ? color + ' font-medium' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                          <p className="font-poppins text-sm font-semibold">{label}</p>
                          <p className="font-poppins text-xs text-gray-500 mt-0.5">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trip Type */}
                  <div>
                    <label className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Travel Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TRIP_TYPES.map(({ value, label }) => (
                        <button key={value} type="button" onClick={() => setForm(f => ({ ...f, tripType: value }))}
                          className={`py-2.5 px-3 rounded-xl border font-poppins text-sm transition-all text-center
                            ${form.tripType === value ? 'bg-purple-50 text-purple-700 border-purple-200 font-medium' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save */}
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSave} disabled={loading}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-poppins text-sm font-medium transition-colors">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border border-gray-200 rounded-xl font-poppins text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <div className="space-y-5">
                  {/* Info Cards */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
                    <h2 className="font-poppins text-base font-semibold text-slate-900 mb-5">Personal Information</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { icon: User,     label: 'Name',        value: user.name },
                        { icon: Mail,     label: 'Email',       value: user.email },
                        { icon: Phone,    label: 'Phone',       value: user.phone     || '—' },
                        { icon: MapPin,   label: 'Location',    value: user.location  || '—' },
                        { icon: Globe,    label: 'Country',     value: user.country   || '—' },
                        { icon: Calendar, label: 'Member Since',value: memberSince },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                            <Icon className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-poppins text-xs text-gray-400">{label}</p>
                            <p className="font-poppins text-sm font-medium text-slate-800 mt-0.5">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {user.bio && (
                      <div className="mt-5 pt-5 border-t border-gray-100">
                        <p className="font-poppins text-xs text-gray-400 mb-2">About</p>
                        <p className="font-poppins text-sm text-gray-700 leading-relaxed">{user.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Travel Preferences */}
                  {((user.interests?.length || 0) > 0 || user.budget || user.tripType) && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
                      <h2 className="font-poppins text-base font-semibold text-slate-900 mb-5">Travel Preferences</h2>
                      {(user.interests?.length || 0) > 0 && (
                        <div className="mb-5">
                          <p className="font-poppins text-xs text-gray-400 mb-2">Interests</p>
                          <div className="flex flex-wrap gap-2">
                            {(user.interests || []).map(interest => {
                              const opt = INTEREST_OPTIONS.find(o => o.value === interest);
                              const Icon = opt?.icon || Sparkles;
                              return (
                                <span key={interest} className={`inline-flex items-center gap-1.5 text-sm font-poppins font-medium px-3 py-1.5 rounded-full border ${opt?.color || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                  <Icon className="w-3.5 h-3.5" /> {interest}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4">
                        {user.budget && (
                          <div>
                            <p className="font-poppins text-xs text-gray-400 mb-1">Budget</p>
                            <span className="font-poppins text-sm font-medium text-slate-800 capitalize">{user.budget}-range</span>
                          </div>
                        )}
                        {user.tripType && (
                          <div>
                            <p className="font-poppins text-xs text-gray-400 mb-1">Travel Style</p>
                            <span className="font-poppins text-sm font-medium text-slate-800 capitalize">{user.tripType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-poppins text-base font-semibold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        { icon: Heart,    label: 'My Wishlist',   href: '/wishlist',       color: 'text-rose-600  bg-rose-50'    },
                        { icon: Compass,  label: 'Plan a Trip',   href: '/planner',        color: 'text-purple-600 bg-purple-50' },
                        { icon: Star,     label: 'My Reviews',    onClick: () => setActiveTab('reviews'), color: 'text-amber-600 bg-amber-50' },
                      ].map(({ icon: Icon, label, href, onClick, color }) => {
                        const Tag = href ? 'a' : 'button';
                        const props: any = href ? { href } : { onClick };
                        return (
                          <Tag key={label} {...props} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group w-full text-left">
                            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-poppins text-sm font-medium text-slate-700 flex-1">{label}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                          </Tag>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── TRIPS TAB ───────────────────────────────────────────── */}
          {activeTab === 'trips' && (
            <motion.div key="trips" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Saved AI itineraries */}
              {tripPlans.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 mb-6">
                  <h2 className="font-poppins text-xl font-semibold text-slate-900 mb-6">Saved itineraries</h2>
                  <div className="space-y-4">
                    {tripPlans.map((p: any) => {
                      const dests = Array.isArray(p.destinations) ? p.destinations
                        : (() => { try { return JSON.parse(p.destinations || '[]'); } catch { return []; } })();
                      return (
                        <div key={p.id} className="p-4 rounded-2xl border border-gray-100 bg-purple-50/40">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="font-poppins font-semibold text-slate-900 text-sm">{p.name}</p>
                            <span className="font-poppins text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 capitalize shrink-0">{p.status || 'planning'}</span>
                          </div>
                          {p.description && <p className="font-poppins text-xs text-gray-500 mb-2 line-clamp-2">{p.description}</p>}
                          {dests.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {dests.slice(0, 6).map((d: any, i: number) => (
                                <a key={i} href={d.slug ? `/explore/${d.slug}` : undefined}
                                  className="text-xs font-poppins text-purple-700 bg-white border border-purple-200 rounded-full px-2.5 py-0.5 hover:bg-purple-100 transition-colors">
                                  {d.name || d.slug}
                                </a>
                              ))}
                              {dests.length > 6 && <span className="text-xs font-poppins text-gray-400 self-center">+{dests.length - 6} more</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
                <h2 className="font-poppins text-xl font-semibold text-slate-900 mb-6">My Bookings & Trips</h2>
                {bookingsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Compass className="w-8 h-8 text-purple-300" />
                    </div>
                    <p className="font-poppins text-gray-500 mb-4">No trips booked yet</p>
                    <a href="/explore" className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-full font-poppins text-sm font-medium hover:bg-purple-700 transition-colors">
                      Explore Destinations
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((b: any) => (
                      <div key={b.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                          <MapPin className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-poppins font-semibold text-slate-900 text-sm">{b.destinationName || b.destination_name || 'Destination'}</p>
                          <p className="font-poppins text-xs text-gray-500 mt-0.5">
                            {b.checkIn || b.check_in} · {b.guests || 1} guest(s)
                          </p>
                        </div>
                        <span className={`font-poppins text-xs font-semibold px-2.5 py-1 rounded-full ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          b.status === 'pending'   ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── REVIEWS TAB ─────────────────────────────────────────── */}
          {activeTab === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-poppins text-xl font-semibold text-slate-900">My Reviews</h2>
                    <p className="font-poppins text-sm text-gray-500 mt-1">
                      Reviews you've written across Bengal Trails
                    </p>
                  </div>
                  {myReviews.length > 0 && (
                    <span className="font-poppins text-sm font-semibold text-purple-600 bg-purple-50 rounded-full px-3 py-1">
                      {myReviews.length} {myReviews.length === 1 ? 'review' : 'reviews'}
                    </span>
                  )}
                </div>

                {reviewsLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : myReviews.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-amber-300" />
                    </div>
                    <h3 className="font-poppins text-base font-semibold text-slate-900 mb-2">No reviews yet</h3>
                    <p className="font-poppins text-sm text-gray-500 mb-5">
                      Share your experiences to help fellow travelers discover Bengal
                    </p>
                    <a href="/explore"
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-full font-poppins text-sm font-medium hover:bg-purple-700 transition-colors">
                      <Compass className="w-4 h-4" /> Explore Destinations
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReviews.map((review: any) => {
                      const slug       = review.destinationSlug || review.destination_slug;
                      const placeImage = (review.destinationImage || review.destination_image) || `https://source.unsplash.com/featured/?${encodeURIComponent(slug)}`;
                      const placeTitle = (review.destinationTitle || review.destination_title) || slug;
                      const placeUrl   = `#/explore/${slug}`;
                      const createdAt  = review.createdAt || review.created_at;
                      const dt = createdAt ? new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                      return (
                        <div key={review.id}
                          className="group border border-gray-100 rounded-2xl overflow-hidden hover:border-purple-200 hover:shadow-md transition-all bg-white">
                          <div className="flex flex-col sm:flex-row">
                            {/* Image — click to go to place */}
                            <a href={placeUrl} className="sm:w-40 h-32 sm:h-auto shrink-0 overflow-hidden bg-gray-100 relative">
                              <img
                                src={placeImage}
                                alt={placeTitle}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400'; }}
                              />
                            </a>

                            <div className="flex-1 p-4 flex flex-col">
                              {/* Header: place name + rating */}
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <a href={placeUrl} className="flex-1 min-w-0">
                                  <h3 className="font-poppins text-base font-semibold text-slate-900 hover:text-purple-700 transition-colors truncate">
                                    {placeTitle}
                                  </h3>
                                  <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s}
                                          className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'}`}
                                        />
                                      ))}
                                    </div>
                                    <span className="font-poppins text-xs text-gray-400">{dt}</span>
                                    {review.status === 'pending' && (
                                      <span className="font-poppins text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        Pending Review
                                      </span>
                                    )}
                                  </div>
                                </a>

                                {/* Delete button */}
                                <button onClick={() => handleDeleteReview(review.id)}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                  title="Delete review">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Title */}
                              {review.title && (
                                <h4 className="font-poppins text-sm font-semibold text-slate-800 mb-1.5">
                                  {review.title}
                                </h4>
                              )}

                              {/* Content */}
                              <p className="font-poppins text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                                {review.content}
                              </p>

                              {/* Footer link */}
                              <a href={placeUrl}
                                className="inline-flex items-center gap-1.5 text-xs font-poppins font-medium text-purple-600 hover:text-purple-700 mt-auto self-start group/link">
                                View on {placeTitle}
                                <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── SETTINGS TAB ────────────────────────────────────────── */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="space-y-5">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
                  <h2 className="font-poppins text-xl font-semibold text-slate-900 mb-5">Account Settings</h2>
                  <div className="space-y-3">
                    <a href="/forgot-password"
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-poppins text-sm font-semibold text-slate-900">Change Password</p>
                        <p className="font-poppins text-xs text-gray-500 mt-0.5">Update your account password</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                    <button onClick={signOut}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                        <LogOut className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-poppins text-sm font-semibold text-slate-900">Sign Out</p>
                        <p className="font-poppins text-xs text-gray-500 mt-0.5">Sign out of your account</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-7">
                  <h2 className="font-poppins text-base font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Danger Zone
                  </h2>
                  <p className="font-poppins text-sm text-gray-500 mb-5">
                    Deleting your account is permanent and cannot be undone. All your data, bookings, and reviews will be removed.
                  </p>
                  <button onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-xl font-poppins text-sm font-medium transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Delete Account Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="font-poppins text-xl font-bold text-slate-900 text-center mb-2">Delete Account?</h3>
              <p className="font-poppins text-sm text-gray-500 text-center mb-6 leading-relaxed">
                This is permanent. Type your email <strong className="text-slate-700">{user.email}</strong> to confirm.
              </p>
              <input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder={user.email}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 mb-4 transition-colors"
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-poppins text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleteConfirm !== user.email}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl font-poppins text-sm font-medium transition-colors">
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
