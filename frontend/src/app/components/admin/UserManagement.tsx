import { API_BASE } from '../../utils/api';
import { useState, useEffect } from 'react';
import { Users, Shield, Ban, Search, Mail, Calendar, Crown, UserX, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  status: 'active' | 'banned';
  wishlist?: string[];
  lastActive?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin' | 'moderator'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success(`User role updated to ${newRole}`);
      } else {
        toast.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error updating user role');
    }
  };

  const handleBanToggle = async (userId: string, currentStatus: 'active' | 'banned') => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        toast.success(`User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully`);
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold flex items-center gap-1">
          <Crown className="w-3 h-3" /> Admin
        </span>;
      case 'moderator':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-1">
          <Shield className="w-3 h-3" /> Moderator
        </span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">User</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Active
        </span>
      : <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
          <UserX className="w-3 h-3" /> Banned
        </span>;
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    moderators: users.filter(u => u.role === 'moderator').length,
    banned: users.filter(u => u.status === 'banned').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-1">User Management</h2>
        <p className="text-gray-600">Manage users, roles, and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Administrators</p>
          <p className="text-3xl font-bold text-purple-600">{stats.admins}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Moderators</p>
          <p className="text-3xl font-bold text-indigo-600">{stats.moderators}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Banned Users</p>
          <p className="text-3xl font-bold text-red-600">{stats.banned}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Role:</span>
            <button
              onClick={() => setFilterRole('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterRole === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRole('admin')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterRole === 'admin' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setFilterRole('moderator')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterRole === 'moderator' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Moderator
            </button>
            <button
              onClick={() => setFilterRole('user')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterRole === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              User
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Status:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'active' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('banned')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'banned' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Banned
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleBanToggle(user.id, user.status)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          user.status === 'active'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.status === 'active' ? (
                          <span className="flex items-center gap-1">
                            <Ban className="w-4 h-4" />
                            Ban
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Unban
                          </span>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-center text-gray-600">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}
