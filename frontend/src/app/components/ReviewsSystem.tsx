import { API_BASE, getToken} from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, Award, TrendingUp } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { Avatar } from './Avatar';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Review {
  id: string;
  destinationSlug: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  photos: string[];
  visitDate: string;
  helpfulCount: number;
  createdAt: string;
  verified: boolean;
}

interface ReviewsSystemProps {
  destinationSlug: string;
  destinationName: string;
}

export const ReviewsSystem: React.FC<ReviewsSystemProps> = ({
  destinationSlug,
  destinationName,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [photos, setPhotos] = useState<string[]>([]);
  const [subRatings, setSubRatings] = useState({ location: 0, food: 0, value: 0 });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
  }, [destinationSlug, sortBy, filterRating]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/reviews/${destinationSlug}?sort=${sortBy}${filterRating ? `&rating=${filterRating}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${getToken() || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      // Transient (offline / cold start) — degrade quietly to an empty list
      // instead of spamming the production console with red errors.
      if (import.meta.env.DEV) console.debug('Reviews load failed (transient):', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast.error('Please sign in to write a review');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        `${API_BASE}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken() || ''}`,
          },
          body: JSON.stringify({
            destinationSlug,
            userId: user.id,
            userName: user.name || user.email,
            rating,
            title,
            content,
            visitDate,
            photos,
            subRatings,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.pendingModeration) {
          toast.success('Review submitted! It will appear after admin approval.');
        } else {
          toast.success('Review submitted successfully!');
        }
        setShowWriteReview(false);
        setTitle('');
        setContent('');
        setVisitDate('');
        setRating(5);
        setPhotos([]);
        loadReviews();
        // Broadcast so place cards / profile / detail pages refresh their counts
        window.dispatchEvent(new CustomEvent('bt:review-changed', { detail: { slug: destinationSlug } }));
      } else if (response.status === 409) {
        toast.error("You've already reviewed this place. Delete your old review to write a new one.");
      } else {
        const data = await response.json().catch(() => ({} as any));
        const detail = data?.errors?.[0]?.message || data?.error;
        toast.error(detail ? `Couldn't submit: ${detail}` : `Failed to submit review (${response.status})`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    if (!user) {
      toast.error('Please sign in to mark reviews as helpful');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/reviews/${reviewId}/helpful`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getToken() || ''}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (response.ok) {
        loadReviews();
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      dist[review.rating as keyof typeof dist]++;
    });
    return dist;
  };

  const ratingDist = getRatingDistribution();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('common.reviews')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-purple-600">
                {getAverageRating()}
              </span>
              <div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(Number(getAverageRating()))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowWriteReview(!showWriteReview)}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
        >
          {t('reviews.writeReview')}
        </button>
      </div>

      {/* Rating Distribution */}
      <div className="mb-8 p-6 bg-purple-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div
              key={stars}
              className="flex items-center gap-3 cursor-pointer hover:bg-purple-100 p-2 rounded-lg transition-colors"
              onClick={() => setFilterRating(filterRating === stars ? null : stars)}
            >
              <span className="text-sm font-medium w-12">{stars} ★</span>
              <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all"
                  style={{
                    width: `${reviews.length > 0 ? (ratingDist[stars as keyof typeof ratingDist] / reviews.length) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {ratingDist[stars as keyof typeof ratingDist]}
              </span>
            </div>
          ))}
        </div>
        {filterRating && (
          <button
            onClick={() => setFilterRating(null)}
            className="mt-4 text-sm text-purple-600 hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSortBy('recent')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            sortBy === 'recent'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Most Recent
        </button>
        <button
          onClick={() => setSortBy('helpful')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            sortBy === 'helpful'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Most Helpful
        </button>
        <button
          onClick={() => setSortBy('rating')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            sortBy === 'rating'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Highest Rating
        </button>
      </div>

      {/* Write Review Form */}
      <AnimatePresence>
        {showWriteReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-purple-50 rounded-xl"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t('reviews.writeReview')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('reviews.yourRating')}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('reviews.yourReview')}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience with other travelers..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Date
                </label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (optional)
                </label>
                {photos.length === 0 ? (
                  <ImageUploader
                    value=""
                    onChange={(url) => url && setPhotos([url])}
                    folder="bengal-trails/reviews"
                    helperText="Share a photo of your visit (up to 4)"
                    showUrlInput={false}
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {photos.map((p, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square">
                        <img src={p} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-6 h-6 grid place-items-center bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {photos.length < 4 && (
                      <div className="aspect-square">
                        <ImageUploader
                          value=""
                          onChange={(url) => url && setPhotos([...photos, url])}
                          folder="bengal-trails/reviews"
                          showUrlInput={false}
                          allowDrop={false}
                          className="h-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={submitReview}
                  disabled={submitting}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : t('reviews.submit')}
                </button>
                <button
                  onClick={() => setShowWriteReview(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-6 bg-gray-100 rounded-xl">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-3"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <a href={review.userId ? `/u/${review.userId}` : undefined}
                    className="shrink-0 hover:ring-2 hover:ring-purple-300 rounded-full transition">
                    <Avatar name={review.userName} src={review.userAvatar} size={48} />
                  </a>
                  <div>
                    <div className="flex items-center gap-2">
                      <a href={review.userId ? `/u/${review.userId}` : undefined}
                        className="font-semibold text-gray-900 hover:text-purple-700 transition">{review.userName}</a>
                      {review.verified && (
                        <span title="Verified Visitor" aria-label="Verified Visitor">
                          <Award className="w-4 h-4 text-blue-500" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
              <p className="text-gray-700 mb-4">{review.content}</p>
              {review.visitDate && (
                <p className="text-sm text-gray-500 mb-4">
                  Visited: {new Date(review.visitDate).toLocaleDateString()}
                </p>
              )}
              {Array.isArray(review.photos) && review.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.photos.map((p, i) => (
                    <a key={i} href={p} target="_blank" rel="noopener noreferrer"
                      className="block w-20 h-20 rounded-xl overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                      <img src={p} alt={`Review photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => markHelpful(review.id)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {t('reviews.helpful')} ({review.helpfulCount})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
