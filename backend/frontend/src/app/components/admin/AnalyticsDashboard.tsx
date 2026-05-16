import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, MapPin, Users, Eye, Download, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  // Mock data - replace with real API calls
  const userGrowthData = [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 185 },
    { month: 'Mar', users: 240 },
    { month: 'Apr', users: 312 },
    { month: 'May', users: 389 },
    { month: 'Jun', users: 456 },
    { month: 'Jul', users: 523 },
  ];

  const destinationViewsData = [
    { name: 'Darjeeling', views: 4850 },
    { name: 'Sundarbans', views: 3420 },
    { name: 'Victoria Memorial', views: 3150 },
    { name: 'Kalimpong', views: 2890 },
    { name: 'Digha', views: 2650 },
    { name: 'Shantiniketan', views: 2340 },
    { name: 'Mandarmani', views: 2120 },
    { name: 'Murshidabad', views: 1890 },
  ];

  const searchTrendsData = [
    { query: 'hill stations', count: 1245 },
    { query: 'beach resorts', count: 987 },
    { query: 'weekend getaway', count: 856 },
    { query: 'heritage sites', count: 723 },
    { query: 'wildlife tours', count: 645 },
  ];

  const regionDistribution = [
    { name: 'North Bengal', value: 45, color: '#8B5CF6' },
    { name: 'Kolkata & Around', value: 30, color: '#EC4899' },
    { name: 'Coastal Bengal', value: 15, color: '#06B6D4' },
    { name: 'Western Bengal', value: 10, color: '#F59E0B' },
  ];

  const engagementMetrics = [
    { metric: 'Avg. Session Duration', value: '4m 32s', change: '+12%', trend: 'up' },
    { metric: 'Pages per Session', value: '3.8', change: '+8%', trend: 'up' },
    { metric: 'Bounce Rate', value: '42%', change: '-5%', trend: 'down' },
    { metric: 'Return Visitors', value: '38%', change: '+15%', trend: 'up' },
  ];

  const topDestinationsByBooking = [
    { destination: 'Darjeeling', bookings: 245, revenue: 1850000 },
    { destination: 'Sundarbans', bookings: 189, revenue: 1420000 },
    { destination: 'Digha', bookings: 167, revenue: 890000 },
    { destination: 'Mandarmani', bookings: 134, revenue: 756000 },
    { destination: 'Shantiniketan', bookings: 98, revenue: 524000 },
  ];

  const COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Analytics Dashboard</h2>
          <p className="text-gray-600">Track performance and user engagement</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {engagementMetrics.map((metric, index) => (
          <motion.div
            key={metric.metric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <p className="text-sm text-gray-600 mb-2">{metric.metric}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">{metric.value}</p>
              <span className={`text-sm font-semibold ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            User Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Destinations by Views */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            Top Destinations by Views
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={destinationViewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Region Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            Destination Distribution by Region
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Top Search Queries
          </h3>
          <div className="space-y-4">
            {searchTrendsData.map((item, index) => (
              <div key={item.query} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{item.query}</span>
                </div>
                <span className="text-gray-600 font-semibold">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Destinations by Bookings Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Top Destinations by Booking Inquiries
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Destination</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Inquiries</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Est. Revenue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topDestinationsByBooking.map((dest, index) => (
                <tr key={dest.destination} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{dest.destination}</td>
                  <td className="px-6 py-4 text-gray-700">{dest.bookings}</td>
                  <td className="px-6 py-4 text-gray-700">₹{dest.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 font-semibold">+{Math.floor(Math.random() * 30 + 5)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">📈 Key Insight</h3>
          <p className="text-purple-100">
            Hill stations are seeing a <strong>45% increase</strong> in searches compared to last month. 
            Consider promoting Darjeeling and Kalimpong packages!
          </p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">⚡ Action Item</h3>
          <p className="text-pink-100">
            Coastal destinations need more content. Add photos and detailed guides for 
            <strong> Digha and Mandarmani</strong> to boost engagement.
          </p>
        </div>
      </div>
    </div>
  );
}
