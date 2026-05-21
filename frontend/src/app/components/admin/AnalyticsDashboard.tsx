import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, MapPin, Users, Star, Mail, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { authFetch } from '../../utils/api';

interface Stats {
  totalUsers: number; totalDestinations: number; totalReviews: number;
  newsletterSubs: number; newUsersInRange: number; totalEnquiries: number;
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="font-poppins text-2xl font-semibold text-slate-900">{value?.toLocaleString() ?? '—'}</p>
      <p className="font-poppins text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="font-poppins text-xs text-purple-600 mt-1 font-medium">{sub}</p>}
    </div>
  );
}

export function AnalyticsDashboard() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (r: string) => {
    setLoading(true); setError('');
    try {
      const res = await authFetch(`/admin/stats?range=${r}`);
      if (!res.ok) throw new Error('Failed to load stats');
      setData(await res.json());
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(range); }, [range]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="font-poppins text-sm text-gray-500">{error}</p>
      <button onClick={() => load(range)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-poppins text-sm">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  const stats: Stats = data?.stats || {} as any;
  const trend = data?.signupTrend || [];
  const topDests = data?.topDestinations || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-poppins text-xl font-semibold text-slate-900">Analytics</h2>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['7d','30d','90d'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg font-poppins text-sm font-medium transition-all
                ${range === r ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {r === '7d' ? '7 days' : r === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users}     label="Total users"     value={stats.totalUsers}        sub={`+${stats.newUsersInRange || 0} this period`} color="bg-purple-500" />
        <StatCard icon={MapPin}    label="Destinations"    value={stats.totalDestinations} color="bg-blue-500" />
        <StatCard icon={Star}      label="Reviews"         value={stats.totalReviews}      color="bg-amber-500" />
        <StatCard icon={Mail}      label="Newsletter subs" value={stats.newsletterSubs}    color="bg-green-500" />
        <StatCard icon={TrendingUp}label="Enquiries"       value={stats.totalEnquiries}    color="bg-rose-500" />
      </div>

      {trend.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="font-poppins text-sm font-semibold text-slate-900 mb-4">New signups — last {range}</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => String(d).slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              <Line type="monotone" dataKey="users" stroke="#9333ea" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {topDests.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="font-poppins text-sm font-semibold text-slate-900 mb-4">Top destinations by views</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topDests} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              <Bar dataKey="viewCount" fill="#9333ea" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
