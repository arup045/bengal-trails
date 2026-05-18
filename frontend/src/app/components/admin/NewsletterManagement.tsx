import { toast } from 'sonner';
import { API_BASE, getToken} from '../../utils/api';
import { useState, useEffect } from 'react';
import { Mail, Send, Users, FileText, Calendar, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    template: 'plain'
  });
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/newsletter/subscribers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers);
      } else {
        toast.error('Failed to fetch subscribers');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Error loading subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!emailData.subject || !emailData.body) {
      toast.error('Please fill in subject and body');
      return;
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      toast.warning('Send newsletter to all active subscribers?', {
        action: { label: 'Send', onClick: () => resolve(true) },
        cancel: { label: 'Cancel', onClick: () => resolve(false) },
        duration: 8000,
        onDismiss: () => resolve(false),
        onAutoClose: () => resolve(false),
      });
    });
    if (!confirmed) return;

    setSending(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/newsletter/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        toast.success('Newsletter sent successfully!');
        setEmailData({ subject: '', body: '', template: 'plain' });
      } else {
        toast.error('Failed to send newsletter');
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast.error('Error sending newsletter');
    } finally {
      setSending(false);
    }
  };

  const handleExportSubscribers = () => {
    const csv = [
      ['Email', 'Name', 'Subscribed Date', 'Status'],
      ...subscribers.map(sub => [
        sub.email,
        sub.name || 'N/A',
        new Date(sub.subscribedAt).toLocaleDateString(),
        sub.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Subscribers exported!');
  };

  const activeSubscribers = subscribers.filter(s => s.status === 'active');
  const unsubscribed = subscribers.filter(s => s.status === 'unsubscribed');

  const emailTemplates = [
    { 
      id: 'welcome', 
      name: 'Welcome Email',
      subject: 'Welcome to Bengal Trails - Explore West Bengal!',
      body: `Dear [Name],\n\nWelcome to Bengal Trails! We're thrilled to have you join our community of Bengal explorers.\n\nDiscover 197 amazing destinations across West Bengal, from the majestic Himalayas in Darjeeling to the serene beaches of Digha.\n\nStart your journey today: [Website Link]\n\nBest regards,\nThe Bengal Trails Team`
    },
    {
      id: 'monthly',
      name: 'Monthly Highlights',
      subject: 'This Month in West Bengal - Top Destinations & Events',
      body: `Dear Traveler,\n\nHere are this month's top picks for exploring West Bengal:\n\n🏔️ Hill Stations: Perfect weather in Darjeeling and Kalimpong\n🏖️ Beach Getaways: Mandarmani is calling!\n🎭 Cultural Events: Durga Puja preparations underway\n\nExplore more: [Website Link]\n\nHappy Travels!\nBengal Trails Team`
    },
    {
      id: 'promo',
      name: 'Special Offer',
      subject: '🎉 Exclusive Deal: 20% Off on Weekend Packages!',
      body: `Dear Adventurer,\n\nSpecial offer just for you!\n\nGet 20% OFF on all weekend packages to:\n- Darjeeling Tea Estates\n- Sundarbans Safari\n- Shantiniketan Cultural Tours\n\nBook before [Date]: [Website Link]\n\nDon't miss out!\nBengal Trails Team`
    }
  ];

  const loadTemplate = (template: any) => {
    setEmailData({
      subject: template.subject,
      body: template.body,
      template: template.id
    });
    toast.success(`Template "${template.name}" loaded!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-1">Newsletter Management</h2>
        <p className="text-gray-600">Send updates and engage with subscribers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Subscribers</p>
          <p className="text-3xl font-bold text-purple-600">{subscribers.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Active Subscribers</p>
          <p className="text-3xl font-bold text-green-600">{activeSubscribers.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Unsubscribed</p>
          <p className="text-3xl font-bold text-red-600">{unsubscribed.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Newsletter */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Compose Newsletter
            </h3>

            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter email subject..."
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Body
                </label>
                <textarea
                  value={emailData.body}
                  onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder="Compose your message..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use [Name] and [Website Link] as placeholders
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSendNewsletter}
                  disabled={sending || !emailData.subject || !emailData.body}
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {sending ? 'Sending...' : `Send to ${activeSubscribers.length} Subscribers`}
                </button>
                <button
                  onClick={() => setEmailData({ subject: '', body: '', template: 'plain' })}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Templates & Subscribers */}
        <div className="space-y-6">
          {/* Email Templates */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Quick Templates
            </h3>
            <div className="space-y-2">
              {emailTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <p className="font-semibold text-sm text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-600 truncate">{template.subject}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleExportSubscribers}
                className="w-full flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Subscribers (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Subscribers List
          </h3>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No subscribers yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subscribed</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-900">{sub.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{sub.name || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      {sub.status === 'active' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          Unsubscribed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
