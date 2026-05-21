import { authFetch } from '../utils/api';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, MapPin, Eye, Heart, LayoutDashboard, BarChart3, Mail, Settings, Activity, TrendingUp, Search, Bookmark, Star, FileEdit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import { AdminEnquiries }     from './admin/AdminEnquiries';
import { AdminVendors }       from './admin/AdminVendors';
import { ContentManagement }  from './admin/ContentManagement';
// Charts: most chart logic now lives in AnalyticsDashboard, but the
// Overview tab still renders inline charts in this file (lines ~175-540),
// so we keep recharts imports here.
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';

export function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'destinations' | 'users' | 'searches' | 'analytics' | 'enquiries' | 'vendors' | 'content'>('overview');
  // Stat keys mirror the real /admin/stats response (camelCased by the API middleware).
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDestinations: 0,
    totalReviews: 0,
    newsletterSubs: 0,
    newUsersInRange: 0,
    totalEnquiries: 0,
  });
  const [destinations, setDestinations] = useState<any[]>([]);
  const [signupTrend, setSignupTrend] = useState<any[]>([]);
  const [searchStats, setSearchStats] = useState<{ total: number; unique: number; topTerms: any[] }>({ total: 0, unique: 0, topTerms: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Wait until the session has finished restoring before deciding access.
    // Previously this redirected the moment isAdmin was false — which is always
    // the case during the async session restore on a page refresh — so an admin
    // who reloaded /admin (or arrived right after login) was bounced to home.
    if (authLoading) return;
    if (!isAdmin) {
      window.location.hash = '#/';
      return;
    }
    fetchStats();
  }, [isAdmin, authLoading]);

  // Fetch REAL data: aggregate stats + the full destinations list (used to derive
  // the category/region/rating charts). authFetch auto-refreshes an expired token.
  const fetchStats = async () => {
    try {
      const [statsRes, destRes] = await Promise.all([
        authFetch('/admin/stats?range=30d'),
        authFetch('/admin/destinations'),
      ]);
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.stats) setStats(data.stats);
        if (Array.isArray(data.signupTrend)) setSignupTrend(data.signupTrend);
        if (data.searchStats) setSearchStats(data.searchStats);
      }
      if (destRes.ok) {
        const data = await destRes.json();
        if (Array.isArray(data.destinations)) setDestinations(data.destinations);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // While the session is still being restored we can't yet know if the user is
  // an admin — show a neutral loader instead of flashing "Access Denied".
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // ── Derived chart data — computed from REAL fetched data, no fabrication ──────
  const num = (v: any) => Number(v) || 0;

  // Total destination views (sum of real view_count) and average rating.
  const totalViews = destinations.reduce((s, d) => s + num(d.viewCount), 0);
  const rated = destinations.filter(d => num(d.rating) > 0);
  const avgRating = rated.length ? rated.reduce((s, d) => s + num(d.rating), 0) / rated.length : 0;
  const categoryCount = new Set(destinations.map(d => d.category).filter(Boolean)).size;

  // Region distribution — derived dynamically from whatever regions exist.
  const destinationsByRegion = Object.entries(
    destinations.reduce((acc: Record<string, number>, d) => {
      const k = d.region || 'Other'; acc[k] = (acc[k] || 0) + 1; return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Category distribution — derived dynamically from real categories.
  const destinationsByCategory = Object.entries(
    destinations.reduce((acc: Record<string, number>, d) => {
      const k = d.category || 'Other'; acc[k] = (acc[k] || 0) + 1; return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  // Real signup trend (daily) re-shaped for the Overview line chart.
  const monthlyVisits = signupTrend.map((s: any) => ({ month: s.date, visits: num(s.users) }));

  // Top destinations by REAL view_count.
  const topDestinations = [...destinations]
    .sort((a, b) => num(b.viewCount) - num(a.viewCount))
    .slice(0, 8)
    .map(d => ({ name: d.name, views: num(d.viewCount) }));

  // Real rating distribution buckets.
  const ratingDistribution = [
    { rating: '5.0',     count: destinations.filter(d => num(d.rating) >= 5).length },
    { rating: '4.5-4.9', count: destinations.filter(d => num(d.rating) >= 4.5 && num(d.rating) < 5).length },
    { rating: '4.0-4.4', count: destinations.filter(d => num(d.rating) >= 4.0 && num(d.rating) < 4.5).length },
    { rating: '3.5-3.9', count: destinations.filter(d => num(d.rating) >= 3.5 && num(d.rating) < 4.0).length },
    { rating: '<3.5',    count: destinations.filter(d => num(d.rating) > 0 && num(d.rating) < 3.5).length },
  ];

  // Real user growth from the signup trend: cumulative line + daily bars.
  const baseUsers = Math.max(0, num(stats.totalUsers) - signupTrend.reduce((s: number, d: any) => s + num(d.users), 0));
  let runningUsers = baseUsers;
  const userGrowthCumulative = signupTrend.map((d: any) => { runningUsers += num(d.users); return { month: d.date, users: runningUsers }; });
  const userGrowthDaily = signupTrend.map((d: any) => ({ day: d.date, active: num(d.users) }));

  const COLORS = ['#9333ea', '#dc2626', '#ea580c', '#0891b2'];

  const tabs = [
    { id: 'overview',      label: 'Overview',     icon: LayoutDashboard },
    { id: 'content',       label: 'Content',      icon: FileEdit        },
    { id: 'destinations',  label: 'Destinations', icon: MapPin          },
    { id: 'users',         label: 'Users',        icon: Users           },
    { id: 'searches',      label: 'Searches',     icon: Search          },
    { id: 'analytics',     label: 'Analytics',    icon: BarChart3       },
    { id: 'enquiries',     label: 'Enquiries',    icon: Mail            },
    { id: 'vendors',       label: 'Partners',     icon: Star            },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-52 h-full bg-gradient-to-b from-[#8B0000] to-[#4B0000] p-6 flex flex-col z-50">
        {/* Bengal Trails Logo */}
        <div className="mb-8">
          <div className="bg-white rounded-lg p-4 mb-4">
            <h1 className="text-[#8B0000] font-['Poppins'] font-extrabold text-4xl text-center">
              Bengal Trails
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full px-3 py-2.5 rounded-lg text-left font-poppins font-medium text-sm flex items-center gap-2.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-52 p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-white text-2xl font-bold uppercase tracking-wider mb-8">OVERVIEW</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Total Destinations</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{stats.totalDestinations}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Total Users</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Average Rating</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{avgRating ? avgRating.toFixed(1) : '—'}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Total Views</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{totalViews.toLocaleString()}</div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Destinations by Category */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-white text-sm uppercase mb-4">Destinations by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={destinationsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#ff6b6b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Visits Trend */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-white text-sm uppercase mb-4">New User Signups (30d)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyVisits}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="visits" stroke="#ff6b6b" strokeWidth={3} dot={{ fill: '#ff6b6b', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Region Distribution Pie */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-white text-sm uppercase mb-4">Distribution by Region</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={destinationsByRegion}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {destinationsByRegion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* West Bengal Map */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-white text-sm uppercase mb-4">Location Distribution</h3>
                  <svg viewBox="0 0 300 400" className="w-full h-[250px]">
                    {/* Simplified West Bengal Map */}
                    <path
                      d="M 150 50 L 180 80 L 190 110 L 200 140 L 210 170 L 215 200 L 210 230 L 200 260 L 190 290 L 180 320 L 170 340 L 150 360 L 130 340 L 120 320 L 110 290 L 100 260 L 90 230 L 85 200 L 90 170 L 100 140 L 110 110 L 120 80 Z"
                      fill="#2a2a2a"
                      stroke="#ff6b6b"
                      strokeWidth="2"
                    />
                    {/* Region markers */}
                    <circle cx="150" cy="80" r="8" fill="#9333ea" opacity="0.8" />
                    <circle cx="140" cy="150" r="8" fill="#dc2626" opacity="0.8" />
                    <circle cx="160" cy="220" r="8" fill="#ea580c" opacity="0.8" />
                    <circle cx="150" cy="300" r="8" fill="#0891b2" opacity="0.8" />
                    
                    {/* Labels */}
                    <text x="150" y="45" textAnchor="middle" fill="#9333ea" fontSize="11">North</text>
                    <text x="230" y="150" textAnchor="start" fill="#dc2626" fontSize="11">Central</text>
                    <text x="230" y="220" textAnchor="start" fill="#ea580c" fontSize="11">South</text>
                    <text x="150" y="380" textAnchor="middle" fill="#0891b2" fontSize="11">Coastal</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Bengal Trails Branding Center */}
            <div className="flex items-center justify-center my-8">
              <div className="text-center">
                <h1 className="text-white font-['Poppins'] font-extrabold text-6xl mb-2">Bengal Trails</h1>
                <p className="text-gray-400 text-sm uppercase tracking-widest">West Bengal Tourism</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'destinations' && (
          <div className="space-y-6">
            <h1 className="text-white text-2xl font-bold uppercase tracking-wider mb-8">DESTINATIONS</h1>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Total Destinations</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{destinations.length}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Top Rated</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{destinations.filter(d => num(d.rating) >= 4.5).length}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Average Rating</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{avgRating ? avgRating.toFixed(1) : '—'}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Categories</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{categoryCount}</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-white text-sm uppercase mb-4">Top Destinations by Views</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topDestinations} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="name" type="category" stroke="#666" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="views" fill="#ff6b6b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-white text-sm uppercase mb-4">Rating Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="rating" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#9333ea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bengal Trails Branding */}
            <div className="flex items-center justify-center my-8">
              <div className="text-center">
                <h1 className="text-white font-['Poppins'] font-extrabold text-6xl mb-2">Bengal Trails</h1>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h1 className="text-white text-2xl font-bold uppercase tracking-wider mb-8">USERS</h1>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Total Users</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">New (30 days)</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{stats.newUsersInRange.toLocaleString()}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Reviews</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{stats.totalReviews.toLocaleString()}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Newsletter Subs</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{stats.newsletterSubs.toLocaleString()}</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-white text-sm uppercase mb-4">Total Users Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthCumulative}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 11 }} tickFormatter={(d) => String(d).slice(5)} />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-white text-sm uppercase mb-4">New Users Per Day (30d)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userGrowthDaily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#666" tick={{ fontSize: 11 }} tickFormatter={(d) => String(d).slice(5)} />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="active" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bengal Trails Branding */}
            <div className="flex items-center justify-center my-8">
              <div className="text-center">
                <h1 className="text-white font-['Poppins'] font-extrabold text-6xl mb-2">Bengal Trails</h1>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'searches' && (
          <div className="space-y-6">
            <h1 className="text-white text-2xl font-bold uppercase tracking-wider mb-8">SEARCHES</h1>

            {searchStats.topTerms.length === 0 ? (
              /* No searches recorded yet — honest empty state (never fabricated). */
              <div className="bg-[#1a1a1a] rounded-lg p-12 border border-gray-800 flex flex-col items-center justify-center text-center min-h-[360px]">
                <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-5">
                  <Search className="w-8 h-8 text-[#ff6b6b]" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">No searches recorded yet</h3>
                <p className="text-gray-400 text-sm max-w-md">
                  Real top queries and trends appear here as visitors search the site.
                </p>
              </div>
            ) : (
              <>
                {/* Stats — real, from analytics_events (last 30 days) */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                    <div className="text-gray-400 text-xs uppercase mb-2">Total Searches (30d)</div>
                    <div className="text-[#ff6b6b] text-4xl font-bold">{searchStats.total.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                    <div className="text-gray-400 text-xs uppercase mb-2">Unique Queries</div>
                    <div className="text-[#ff6b6b] text-4xl font-bold">{searchStats.unique.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                    <div className="text-gray-400 text-xs uppercase mb-2">Top Query</div>
                    <div className="text-[#ff6b6b] text-2xl font-bold truncate capitalize">{searchStats.topTerms[0]?.term || '—'}</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                    <div className="text-gray-400 text-xs uppercase mb-2">Distinct Terms Shown</div>
                    <div className="text-[#ff6b6b] text-4xl font-bold">{searchStats.topTerms.length}</div>
                  </div>
                </div>

                {/* Top search terms — real */}
                <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                  <h3 className="text-white text-sm uppercase mb-4">Top Search Terms (30d)</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={searchStats.topTerms} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis type="number" stroke="#666" allowDecimals={false} />
                      <YAxis dataKey="term" type="category" stroke="#666" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="count" fill="#ff6b6b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Bengal Trails Branding */}
            <div className="flex items-center justify-center my-8">
              <div className="text-center">
                <h1 className="text-white font-['Poppins'] font-extrabold text-6xl mb-2">Bengal Trails</h1>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            <ContentManagement />
          </div>
        )}

        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            <AdminEnquiries />
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="space-y-4">
            <AdminVendors />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AnalyticsDashboard />
          </div>
        )}
      </div>
    </div>
  );
}