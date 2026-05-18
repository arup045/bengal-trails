import { API_BASE, getToken} from '../utils/api';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, MapPin, Eye, Heart, LayoutDashboard, BarChart3, Mail, Settings, Activity, TrendingUp, Search, Bookmark, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import { AdminEnquiries }     from './admin/AdminEnquiries';
import { AdminVendors }       from './admin/AdminVendors';
// Charts now live inside AnalyticsDashboard component

export function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'destinations' | 'users' | 'searches' | 'analytics' | 'enquiries' | 'vendors'>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDestinations: 0,
    totalViews: 0,
    totalWishlists: 0,
    totalNewsletterSubs: 0
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!isAdmin) {
      window.location.hash = '#/';
      return;
    }
    fetchStats();
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Chart Data
  const destinationsByRegion = [
    { name: 'North Bengal', value: [].filter(p => p.region === 'North Bengal').length },
    { name: 'South Bengal', value: [].filter(p => p.region === 'South Bengal').length },
    { name: 'Central Bengal', value: [].filter(p => p.region === 'Central Bengal').length },
    { name: 'Coastal Bengal', value: [].filter(p => p.region === 'Coastal Bengal').length },
  ];

  const destinationsByCategory = [
    { name: 'Heritage', count: [].filter(p => p.category === 'Heritage').length },
    { name: 'Nature', count: [].filter(p => p.category === 'Nature').length },
    { name: 'Adventure', count: [].filter(p => p.category === 'Adventure').length },
    { name: 'Beach', count: [].filter(p => p.category === 'Beach').length },
    { name: 'Hill Station', count: [].filter(p => p.category === 'Hill Station').length },
    { name: 'Wildlife', count: [].filter(p => p.category === 'Wildlife').length },
    { name: 'Religious', count: [].filter(p => p.category === 'Religious').length },
    { name: 'Shopping', count: [].filter(p => p.category === 'Shopping').length },
  ];

  const monthlyVisits = [
    { month: 'Jan 2025', visits: 3200 },
    { month: 'Feb 2025', visits: 2800 },
    { month: 'Mar 2025', visits: 4100 },
    { month: 'Apr 2025', visits: 3800 },
    { month: 'May 2025', visits: 4500 },
    { month: 'Jun 2025', visits: 3900 },
  ];

  const topDestinations = [].slice(0, 8).map(place => ({
    name: place.name,
    views: Math.floor(Math.random() * 500) + 100
  }));

  const searchTrends = [
    { term: 'Darjeeling', count: 234 },
    { term: 'Sundarbans', count: 189 },
    { term: 'Hill Stations', count: 156 },
    { term: 'Beach Resorts', count: 143 },
    { term: 'Heritage Sites', count: 128 },
    { term: 'Wildlife', count: 98 },
  ];

  const COLORS = ['#9333ea', '#dc2626', '#ea580c', '#0891b2'];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'destinations', label: 'Destinations' },
    { id: 'users', label: 'Users' },
    { id: 'searches', label: 'Searches' },
    { id: 'analytics',  label: 'Analytics'  },
    { id: 'enquiries',  label: 'Enquiries'  },
    { id: 'vendors',    label: 'Partners'   },
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
        <nav className="flex-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full px-4 py-3 rounded-lg text-left font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#8B0000] text-white'
                  : 'bg-transparent text-white/80 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
                <div className="text-gray-400 text-xs uppercase mb-2">Active Users</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{stats.totalUsers || 1247}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Average Rating</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">4.5</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Total Views</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{(stats.totalViews || 8945).toLocaleString()}</div>
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
                <h3 className="text-white text-sm uppercase mb-4">Visitor Trend</h3>
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
                <div className="text-[#ff6b6b] text-4xl font-bold">{0}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Top Rated</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{[].filter(p => p.rating >= 4.5).length}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Average Rating</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">4.5</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Categories</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">8</div>
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
                  <BarChart data={[
                    { rating: '5.0', count: 45 },
                    { rating: '4.5-4.9', count: 68 },
                    { rating: '4.0-4.4', count: 52 },
                    { rating: '3.5-3.9', count: 23 },
                    { rating: '3.0-3.4', count: 9 },
                  ]}>
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
                <div className="text-[#ff6b6b] text-4xl font-bold">{stats.totalUsers || 1247}</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Active Today</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">342</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">New This Month</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">156</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Newsletter Subs</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">{stats.totalNewsletterSubs || 892}</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-white text-sm uppercase mb-4">User Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { month: 'Sep', users: 850 },
                    { month: 'Oct', users: 920 },
                    { month: 'Nov', users: 1050 },
                    { month: 'Dec', users: 1120 },
                    { month: 'Jan', users: 1200 },
                    { month: 'Feb', users: 1247 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#666" />
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
                <h3 className="text-white text-sm uppercase mb-4">User Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { day: 'Mon', active: 156 },
                    { day: 'Tue', active: 189 },
                    { day: 'Wed', active: 234 },
                    { day: 'Thu', active: 198 },
                    { day: 'Fri', active: 276 },
                    { day: 'Sat', active: 342 },
                    { day: 'Sun', active: 298 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#666" />
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

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Total Searches</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">15.2K</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Unique Queries</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">3,456</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Avg Results</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">8.7</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <div className="text-gray-400 text-xs uppercase mb-2">Filter Usage</div>
                <div className="text-[#ff6b6b] text-4xl font-bold">67%</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-white text-sm uppercase mb-4">Top Search Terms</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={searchTrends} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="term" type="category" stroke="#666" width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#ff6b6b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-white text-sm uppercase mb-4">Search by Time of Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { hour: '6am', searches: 45 },
                    { hour: '9am', searches: 156 },
                    { hour: '12pm', searches: 234 },
                    { hour: '3pm', searches: 189 },
                    { hour: '6pm', searches: 298 },
                    { hour: '9pm', searches: 267 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="hour" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="searches" stroke="#ea580c" strokeWidth={3} dot={{ fill: '#ea580c', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-white text-sm uppercase mb-4">Filter Usage Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Region Filter', value: 45 },
                        { name: 'Category Filter', value: 32 },
                        { name: 'Price Filter', value: 15 },
                        { name: 'Rating Filter', value: 8 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
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

              {/* West Bengal Map with search density */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-white text-sm uppercase mb-4">Search Origin Distribution</h3>
                  <svg viewBox="0 0 300 400" className="w-full h-[300px]">
                    {/* West Bengal Map */}
                    <path
                      d="M 150 50 L 180 80 L 190 110 L 200 140 L 210 170 L 215 200 L 210 230 L 200 260 L 190 290 L 180 320 L 170 340 L 150 360 L 130 340 L 120 320 L 110 290 L 100 260 L 90 230 L 85 200 L 90 170 L 100 140 L 110 110 L 120 80 Z"
                      fill="#2a2a2a"
                      stroke="#ff6b6b"
                      strokeWidth="2"
                    />
                    {/* Heat map points */}
                    <circle cx="150" cy="80" r="12" fill="#ff6b6b" opacity="0.7">
                      <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="140" cy="150" r="10" fill="#ff6b6b" opacity="0.6">
                      <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="160" cy="220" r="14" fill="#ff6b6b" opacity="0.8">
                      <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="150" cy="300" r="11" fill="#ff6b6b" opacity="0.65">
                      <animate attributeName="r" values="11;15;11" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
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