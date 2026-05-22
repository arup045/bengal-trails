import { API_BASE, getToken} from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Flag, Eye, Trash2, Filter, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface Review {
  id: string;
  destinationSlug: string;
  destinationName: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reportCount: number;
  createdAt: string;
}

export const ReviewModeration: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // Backend stores approved reviews as status 'published' — map the tab to it.
      const apiStatus = filter === 'approved' ? 'published' : filter;
      const response = await fetch(
        `${API_BASE}/admin/reviews?status=${apiStatus}`,
        {
          headers: {
            Authorization: `Bearer ${getToken() || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rows = Array.isArray(data.reviews) ? data.reviews : [];
        // Normalize to the component's shape with safe fallbacks. The API returns
        // camelCased keys and does NOT include destinationName/reportCount, so we
        // default them (reading review.destinationName.toLowerCase() used to crash).
        setReviews(rows.map((r: any): Review => ({
          id:              String(r.id),
          destinationSlug: r.destinationSlug || r.destination_slug || '',
          destinationName: r.destinationName || r.destination_name || r.destinationSlug || r.destination_slug || '',
          userId:          r.userId || r.user_id || '',
          userName:        r.userName || r.user_name || 'User',
          rating:          Number(r.rating) || 0,
          title:           r.title || '',
          content:         r.content || '',
          photos:          r.photos || [],
          status:          r.status === 'published' ? 'approved' : (r.status || 'pending'),
          reportCount:     Number(r.reportCount ?? r.report_count ?? 0),
          createdAt:       r.createdAt || r.created_at || new Date().toISOString(),
        })));
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]); // never show fabricated reviews in the admin panel
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/reviews/${id}/approve`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getToken() || ''}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Review approved');
        loadReviews();
      }
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const rejectReview = async (id: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/reviews/${id}/reject`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getToken() || ''}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Review rejected');
        loadReviews();
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    }
  };

  const deleteReview = async (id: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.warning('Permanently delete this review?', {
        action: { label: 'Delete', onClick: () => resolve(true) },
        cancel: { label: 'Cancel', onClick: () => resolve(false) },
        duration: 8000,
        onDismiss: () => resolve(false),
        onAutoClose: () => resolve(false),
      });
    });
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE}/admin/reviews/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getToken() || ''}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Review deleted');
        loadReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter((review) =>
    (review.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (review.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (review.destinationName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Review Moderation</h2>
          <p className="text-gray-600 mt-1">Manage and moderate user reviews</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
            {reviews.filter((r) => r.status === 'pending').length} Pending
          </span>
          <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold">
            {reviews.filter((r) => r.status === 'flagged').length} Flagged
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('flagged')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'flagged'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Flagged
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'approved'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'rejected'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{review.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        review.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : review.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : review.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {review.status.toUpperCase()}
                    </span>
                    {review.reportCount > 0 && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        {review.reportCount} Reports
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="font-semibold">{review.userName}</span>
                    <span>•</span>
                    <span>{review.destinationName}</span>
                    <span>•</span>
                    <span>{'⭐'.repeat(review.rating)}</span>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mb-4">{review.content}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                {review.status !== 'approved' && (
                  <button
                    onClick={() => approveReview(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button
                    onClick={() => rejectReview(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                )}
                <button
                  onClick={() => deleteReview(review.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
