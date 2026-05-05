import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ThumbsUp, Camera, X, Upload, Check, Filter } from 'lucide-react';

interface Review {
  id: string;
  placeSlug: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  date: string;
  helpful: number;
  verified: boolean;
}

interface ReviewsSectionProps {
  placeSlug: string;
  placeName: string;
}

export function ReviewsSection({ placeSlug, placeName }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  
  // Form state
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    userName: '',
    photos: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem('reviews');
    if (savedReviews) {
      const allReviews = JSON.parse(savedReviews);
      const placeReviews = allReviews.filter((r: Review) => r.placeSlug === placeSlug);
      setReviews(placeReviews);
    } else {
      // Generate sample reviews
      generateSampleReviews();
    }
  }, [placeSlug]);

  const generateSampleReviews = () => {
    const sampleReviews: Review[] = [
      {
        id: `${placeSlug}-1`,
        placeSlug,
        userName: 'Priya Sharma',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        rating: 5,
        title: 'Absolutely breathtaking experience!',
        comment: 'Visited during winter and it was magical. The views, the culture, everything exceeded expectations. Highly recommend staying for at least 3 days to fully experience the beauty.',
        photos: [],
        date: '2025-01-05',
        helpful: 24,
        verified: true,
      },
      {
        id: `${placeSlug}-2`,
        placeSlug,
        userName: 'Rajesh Kumar',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 4,
        title: 'Great destination for families',
        comment: 'Perfect place for a family trip. Kids loved it! The local food was delicious and people were very welcoming. Only downside was the crowd during peak season.',
        photos: [],
        date: '2024-12-28',
        helpful: 15,
        verified: true,
      },
      {
        id: `${placeSlug}-3`,
        placeSlug,
        userName: 'Ananya Das',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 5,
        title: 'A photographer\'s paradise',
        comment: 'As a travel photographer, this place offered countless stunning shots. Sunrise and sunset views are phenomenal. Don\'t forget to bring your camera!',
        photos: [],
        date: '2024-12-20',
        helpful: 31,
        verified: false,
      },
    ];
    
    setReviews(sampleReviews);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const review: Review = {
        id: `${placeSlug}-${Date.now()}`,
        placeSlug,
        userName: newReview.userName || 'Anonymous Traveler',
        userAvatar: `https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100`,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        photos: newReview.photos,
        date: new Date().toISOString().split('T')[0],
        helpful: 0,
        verified: false,
      };

      // Save to localStorage
      const savedReviews = localStorage.getItem('reviews');
      const allReviews = savedReviews ? JSON.parse(savedReviews) : [];
      allReviews.push(review);
      localStorage.setItem('reviews', JSON.stringify(allReviews));

      setReviews([review, ...reviews]);
      setSubmitting(false);
      setSubmitted(true);

      // Reset form
      setTimeout(() => {
        setShowAddReview(false);
        setSubmitted(false);
        setNewReview({
          rating: 5,
          title: '',
          comment: '',
          userName: '',
          photos: [],
        });
      }, 2000);
    }, 1500);
  };

  const markHelpful = (reviewId: string) => {
    const updated = reviews.map(r => 
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    );
    setReviews(updated);
    
    // Update localStorage
    const savedReviews = localStorage.getItem('reviews');
    if (savedReviews) {
      const allReviews = JSON.parse(savedReviews);
      const updatedAll = allReviews.map((r: Review) =>
        r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
      );
      localStorage.setItem('reviews', JSON.stringify(updatedAll));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulate upload - in real app, upload to cloud storage
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setNewReview(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 5), // Max 5 photos
      }));
    }
  };

  const removePhoto = (index: number) => {
    setNewReview(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Sorting and filtering
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filteredReviews = filterRating
    ? sortedReviews.filter(r => r.rating === filterRating)
    : sortedReviews;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0,
  }));

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-3xl p-8 border-2 border-purple-200">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Guest Reviews</h3>
            <div className="flex items-center gap-4 justify-center md:justify-start mb-4">
              <div className="text-6xl font-bold text-purple-600">{averageRating}</div>
              <div>
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(parseFloat(averageRating))
                          ? 'fill-orange-400 text-orange-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">Based on {reviews.length} reviews</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddReview(true)}
              className="bg-gradient-to-r from-purple-600 to-orange-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all"
            >
              Write a Review
            </button>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                  filterRating === rating ? 'bg-purple-100' : 'hover:bg-white/50'
                }`}
              >
                <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-purple-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort & Filter Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="recent">Most Recent</option>
            <option value="rating">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
        
        {filterRating && (
          <button
            onClick={() => setFilterRating(null)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear filter
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
            <button
              onClick={() => setShowAddReview(true)}
              className="bg-gradient-to-r from-purple-600 to-orange-600 text-white px-6 py-3 rounded-full"
            >
              Write a Review
            </button>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-purple-200 transition-all"
            >
              <div className="flex items-start gap-4">
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{review.userName}</h4>
                        {review.verified && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.rating
                              ? 'fill-orange-400 text-orange-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                  <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
                  
                  {review.photos.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {review.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Review photo ${idx + 1}`}
                          className="h-24 w-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => markHelpful(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-sm"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Review Modal */}
      <AnimatePresence>
        {showAddReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !submitting && setShowAddReview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600">Your review has been submitted successfully.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Write a Review</h3>
                    <button
                      onClick={() => setShowAddReview(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={submitting}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    {/* Rating */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-3">
                        Your Rating *
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-10 h-10 ${
                                star <= newReview.rating
                                  ? 'fill-orange-400 text-orange-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={newReview.userName}
                        onChange={(e) => setNewReview(prev => ({ ...prev, userName: e.target.value }))}
                        placeholder="Anonymous Traveler"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Review Title *
                      </label>
                      <input
                        type="text"
                        value={newReview.title}
                        onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Summarize your experience..."
                        required
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Your Review *
                      </label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your experience with other travelers..."
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Add Photos (Optional)
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {newReview.photos.map((photo, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={photo}
                              alt={`Upload ${idx + 1}`}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {newReview.photos.length < 5 && (
                          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                            <Camera className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Add Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        You can upload up to 5 photos
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-orange-600 text-white py-4 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
