import { API_BASE } from '../../utils/api';
import { useState } from 'react';
import { Settings, Star, Image as ImageIcon, Bell, Save, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

export function AdminSettings() {
  const [featuredDestinations, setFeaturedDestinations] = useState<string[]>([
    'darjeeling',
    'sundarbans',
    'victoria-memorial'
  ]);
  const [banner, setBanner] = useState({
    enabled: true,
    text: '🎉 Special Offer: 20% OFF on all weekend packages!',
    link: '#/explore',
    bgColor: '#8B5CF6'
  });
  const [notifications, setNotifications] = useState({
    newUserEmail: true,
    newBookingEmail: true,
    weeklyReport: true,
    newsletterConfirmation: true
  });
  const [seo, setSeo] = useState({
    title: 'GOBRO - Explore West Bengal Tourism',
    description: 'Discover 197+ amazing destinations across West Bengal. Plan your perfect trip with GOBRO.',
    keywords: 'West Bengal tourism, Darjeeling, Sundarbans, travel guide, India tourism'
  });
  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          featuredDestinations,
          banner,
          notifications,
          seo
        })
      });

      if (response.ok) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Admin Settings</h2>
          <p className="text-gray-600">Configure site settings and preferences</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Save className="w-5 h-5" />
          Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Destinations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            Featured Destinations
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Select destinations to feature on the homepage
          </p>
          <div className="space-y-3">
            {['Darjeeling', 'Sundarbans', 'Victoria Memorial', 'Kalimpong', 'Digha', 'Shantiniketan'].map((dest) => (
              <label key={dest} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredDestinations.includes(dest.toLowerCase().replace(' ', '-'))}
                  onChange={(e) => {
                    const slug = dest.toLowerCase().replace(' ', '-');
                    if (e.target.checked) {
                      setFeaturedDestinations([...featuredDestinations, slug]);
                    } else {
                      setFeaturedDestinations(featuredDestinations.filter(d => d !== slug));
                    }
                  }}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-700">{dest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            Promotional Banner
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={banner.enabled}
                onChange={(e) => setBanner({ ...banner, enabled: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-700">Enable promotional banner</span>
            </label>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Banner Text
              </label>
              <input
                type="text"
                value={banner.text}
                onChange={(e) => setBanner({ ...banner, text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Link URL
              </label>
              <input
                type="text"
                value={banner.link}
                onChange={(e) => setBanner({ ...banner, link: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={banner.bgColor}
                  onChange={(e) => setBanner({ ...banner, bgColor: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={banner.bgColor}
                  onChange={(e) => setBanner({ ...banner, bgColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Banner Preview */}
            {banner.enabled && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                <div
                  className="p-4 rounded-lg text-white text-center"
                  style={{ backgroundColor: banner.bgColor }}
                >
                  {banner.text}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            Notification Settings
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-gray-700">New User Registration Email</span>
              <input
                type="checkbox"
                checked={notifications.newUserEmail}
                onChange={(e) => setNotifications({ ...notifications, newUserEmail: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-gray-700">New Booking Email</span>
              <input
                type="checkbox"
                checked={notifications.newBookingEmail}
                onChange={(e) => setNotifications({ ...notifications, newBookingEmail: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-gray-700">Weekly Analytics Report</span>
              <input
                type="checkbox"
                checked={notifications.weeklyReport}
                onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-gray-700">Newsletter Confirmation</span>
              <input
                type="checkbox"
                checked={notifications.newsletterConfirmation}
                onChange={(e) => setNotifications({ ...notifications, newsletterConfirmation: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            SEO Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Site Title
              </label>
              <input
                type="text"
                value={seo.title}
                onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={seo.description}
                onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {seo.description.length}/160 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={seo.keywords}
                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate keywords with commas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-4">
          These actions are irreversible. Please be careful.
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Clear All Cache
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Reset Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
