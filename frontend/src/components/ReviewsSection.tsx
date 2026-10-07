"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { addReview, checkReviewEligibility } from '@/lib/api';

interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    name: string;
    avatar?: string | null;
  };
}

interface ReviewsSectionProps {
  listingId: number;
  initialReviews?: ReviewItem[];
  rating: number;
  reviewCount: number;
}

export default function ReviewsSection({
  listingId,
  initialReviews = [],
  rating,
  reviewCount
}: ReviewsSectionProps) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [eligibility, setEligibility] = useState<{ can_review: boolean; reason: string } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Check if current user has completed a stay at this listing
  useEffect(() => {
    if (token) {
      setCheckingEligibility(true);
      checkReviewEligibility(listingId, token)
        .then(res => setEligibility(res))
        .catch(() => setEligibility({ can_review: false, reason: "Unable to verify stay eligibility." }))
        .finally(() => setCheckingEligibility(false));
    } else {
      setEligibility(null);
    }
  }, [listingId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a review comment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      const created = await addReview(listingId, { rating: Number(newRating), comment }, token || undefined);
      
      const newReviewItem: ReviewItem = {
        id: created.id,
        rating: created.rating,
        comment: created.comment,
        created_at: created.created_at || new Date().toISOString(),
        user: {
          name: user?.name || 'Guest',
          avatar: user?.avatar
        }
      };
      
      setReviews(prev => [newReviewItem, ...prev]);
      setComment('');
      setSuccess('Thank you for sharing your experience! Your review is now live.');
      // Update eligibility to prevent duplicate posting if desired
      setEligibility({ can_review: false, reason: "Thank you! You have already submitted a review for your stay." });
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-10 border-t border-neutral-200 space-y-8">
      {/* Overall Score Header */}
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6 fill-[#222222]" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
        <h2 className="text-2xl font-bold text-[#222222]">
          {rating ? Number(rating).toFixed(2) : "4.95"} · {reviews.length || reviewCount} reviews
        </h2>
      </div>

      {/* Ratings Categories breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-8 text-xs font-medium text-neutral-700 bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
        <div>
          <div className="flex justify-between mb-1"><span>Cleanliness</span><span className="font-bold">4.9 ★</span></div>
          <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden"><div className="bg-black h-full w-[98%]" /></div>
        </div>
        <div>
          <div className="flex justify-between mb-1"><span>Accuracy</span><span className="font-bold">5.0 ★</span></div>
          <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden"><div className="bg-black h-full w-[100%]" /></div>
        </div>
        <div>
          <div className="flex justify-between mb-1"><span>Communication</span><span className="font-bold">4.9 ★</span></div>
          <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden"><div className="bg-black h-full w-[98%]" /></div>
        </div>
        <div>
          <div className="flex justify-between mb-1"><span>Location</span><span className="font-bold">5.0 ★</span></div>
          <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden"><div className="bg-black h-full w-[100%]" /></div>
        </div>
        <div>
          <div className="flex justify-between mb-1"><span>Value</span><span className="font-bold">4.8 ★</span></div>
          <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden"><div className="bg-black h-full w-[96%]" /></div>
        </div>
        <div>
          <div className="flex justify-between mb-1"><span>Check-in</span><span className="font-bold">5.0 ★</span></div>
          <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden"><div className="bg-black h-full w-[100%]" /></div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.length > 0 ? (
          reviews.map(r => (
            <div key={r.id} className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {r.user?.avatar ? (
                    <img src={r.user.avatar} alt={r.user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (r.user?.name || "G").charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">{r.user?.name || "Verified Traveler"}</h4>
                  <p className="text-xs text-neutral-400">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent Stay'}
                  </p>
                </div>
                <div className="ml-auto text-xs font-semibold px-2 py-0.5 bg-neutral-100 rounded text-neutral-800">
                  {r.rating} ★
                </div>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {r.comment}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-500 italic col-span-2">No guest reviews yet. Be the first to share your experience!</p>
        )}
      </div>

      {/* Write a Review Section - Only visible if backend verifies that the user has completed a stay */}
      {eligibility?.can_review && (
        <div className="bg-neutral-50 p-6 sm:p-8 rounded-2xl border border-neutral-200 space-y-4">
          <h3 className="text-lg font-bold text-neutral-900">Leave a Review</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
              <span>✓</span>
              <span>Verified Stay Completed — Thank you for visiting! Please share your genuine experience with future guests.</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase text-neutral-600">Rating:</label>
              <select
                value={newRating}
                onChange={e => setNewRating(Number(e.target.value))}
                className="p-2 border border-neutral-300 rounded-xl text-sm font-semibold bg-white cursor-pointer"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                <option value={3}>⭐⭐⭐ (3 - Average)</option>
                <option value={2}>⭐⭐ (2 - Below Average)</option>
                <option value={1}>⭐ (1 - Poor)</option>
              </select>
            </div>

            <textarea
              required
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="What made your stay memorable? How was the location, host, and amenities?"
              className="w-full p-3.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-black focus:outline-none bg-white"
            />

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            {success && <p className="text-xs text-emerald-600 font-medium">{success}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
