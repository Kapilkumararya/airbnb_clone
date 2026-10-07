"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { fetchMyBookings, cancelBooking, addReview } from '@/lib/api';

function TripsContent() {
  const { token, user, isDemoUser } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  // Review modal state
  const [reviewModalBooking, setReviewModalBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewedBookings, setReviewedBookings] = useState<Record<number, boolean>>({});

  const handleOpenReview = (booking: any) => {
    setReviewModalBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewPhotos([]);
    setReviewError('');
  };

  const handleReviewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setReviewPhotos(prev => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalBooking) return;
    if (!reviewComment.trim()) {
      setReviewError('Please write your review comment.');
      return;
    }
    try {
      setIsSubmittingReview(true);
      setReviewError('');

      const finalComment = reviewPhotos.length > 0 
        ? `${reviewComment.trim()}\n\n<!-- PHOTOS: ${JSON.stringify(reviewPhotos)} -->` 
        : reviewComment.trim();

      await addReview(reviewModalBooking.listing_id, {
        rating: reviewRating,
        comment: finalComment
      }, token || undefined);
      setReviewedBookings(prev => ({ ...prev, [reviewModalBooking.id]: true }));
      setFeedback(`🎉 Thank you! Your review has been published for ${reviewModalBooking.listing?.title || 'your stay'}.`);
      setReviewModalBooking(null);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const loadBookings = async () => {
    if (!token) return;
    try {
      const data = await fetchMyBookings(token);
      setBookings(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, [token]);

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this reservation? Your dates will be released.')) {
      return;
    }
    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId, token || undefined);
      setFeedback('Reservation successfully cancelled.');
      await loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-neutral-200 border-t-[#FF385C] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 sm:px-10 lg:px-12 py-10">
      <div className="border-b border-neutral-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#222222]">Trips &amp; Reservations</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Logged in as <span className="font-semibold text-neutral-800">{user?.name}</span> ({user?.email})
          </p>
        </div>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold hover:border-black transition text-center"
        >
          Explore More Places
        </Link>
      </div>
 
       {isDemoUser && (
         <div className="mb-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
           <div className="flex items-start gap-3.5">
             <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold text-lg shrink-0">
               🧪
             </div>
             <div>
               <div className="flex items-center gap-2">
                 <h3 className="text-sm font-bold text-neutral-900">Evaluation Account: Preloaded Past Trips</h3>
                 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                   Demo
                 </span>
               </div>
               <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                 This dummy account is preloaded with <strong>3 completed past trips</strong> (Jaipur, Manali, and Varanasi). 
                 Because completed stays are verified, you can immediately test submitting a review by clicking the <strong>&quot;★ Review this stay&quot;</strong> button on any trip card below, or book new listings to test checkout.
               </p>
             </div>
           </div>
         </div>
       )}

       {feedback && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex justify-between items-center">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookings.map((booking: any) => {
            const checkInDate = new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const checkOutDate = new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const isCancelled = booking.status === 'cancelled';

            return (
              <div 
                key={booking.id} 
                className={`rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col ${
                  isCancelled ? 'border-neutral-200 opacity-75' : 'border-neutral-200'
                }`}
              >
                <div className="relative aspect-[16/10] bg-neutral-100">
                  <img
                    src={booking.listing?.images?.[0]?.image_url || booking.listing?.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"}
                    alt={booking.listing?.title || "Listing"}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    isCancelled 
                      ? 'bg-neutral-800 text-white' 
                      : 'bg-white/95 backdrop-blur-sm text-emerald-700'
                  }`}>
                    {isCancelled ? 'Cancelled' : '✓ Confirmed'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-[#222222] line-clamp-1">
                      {booking.listing?.title || `Stay #${booking.listing_id}`}
                    </h3>
                    <p className="text-sm text-neutral-500">{booking.listing?.location || "India"}</p>
                  </div>

                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 space-y-1.5 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span className="font-medium text-neutral-800">Stay Dates:</span>
                      <span>{checkInDate} – {checkOutDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-neutral-800">Guests:</span>
                      <span>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-neutral-200/80 font-bold text-neutral-900 text-sm">
                      <span>Total Paid:</span>
                      <span>₹{Number(booking.total_price).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/listing/${booking.listing_id}`}
                      className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-center text-xs font-semibold text-neutral-800 hover:border-black transition"
                    >
                      View Property
                    </Link>
                    {!isCancelled && (
                      new Date(booking.check_out) <= new Date() ? (
                        reviewedBookings[booking.id] ? (
                          <span className="py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                            ✓ Reviewed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenReview(booking)}
                            className="py-2.5 px-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                          >
                            ⭐ Review Stay
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="py-2.5 px-3.5 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                        >
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400 text-2xl">
            ✈️
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">No trips booked yet!</h3>
          <p className="text-sm text-neutral-500">
            Time to dust off your bags and start planning your next vacation.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 px-6 py-3 bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            Start searching stays
          </Link>
        </div>
      )}

      {/* Review Stay Modal on Trips Page */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Review Your Stay</h3>
                <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-[280px]">
                  {reviewModalBooking.listing?.title || `Stay #${reviewModalBooking.listing_id}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalBooking(null)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Overall Rating
                </label>
                <select
                  value={reviewRating}
                  onChange={e => setReviewRating(Number(e.target.value))}
                  className="w-full p-3 border border-neutral-300 rounded-xl text-sm font-semibold bg-white cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional stay)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Below expectations)</option>
                  <option value={1}>⭐ (1 - Poor)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="How was your host, check-in, cleanliness, and overall experience?"
                  className="w-full p-3.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-black focus:outline-none bg-white"
                />
              </div>

              {/* Photo Upload Attachment */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    id="trips-review-photo-upload" 
                    onChange={handleReviewPhotoUpload} 
                    className="hidden" 
                  />
                  <label 
                    htmlFor="trips-review-photo-upload" 
                    className="inline-flex items-center gap-2 px-3.5 py-2 border border-neutral-300 rounded-xl text-xs font-semibold hover:border-black cursor-pointer bg-white transition shadow-xs"
                  >
                    <span>📸</span>
                    <span>Attach photos ({reviewPhotos.length})</span>
                  </label>
                  <span className="text-xs text-neutral-400">Optional: show off your trip</span>
                </div>

                {reviewPhotos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
                    {reviewPhotos.map((photo, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-neutral-200 shrink-0 group shadow-xs">
                        <img src={photo} alt={`Attached ${i + 1}`} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setReviewPhotos(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-4 h-4 bg-black/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] transition cursor-pointer"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {reviewError && (
                <p className="text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  {reviewError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalBooking(null)}
                  className="flex-1 py-3 text-sm font-semibold rounded-xl border border-neutral-300 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-3 text-sm font-semibold text-white bg-[#FF385C] hover:bg-[#E00B41] rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TripsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-white text-[#222222] font-sans flex flex-col">
        <Header />
        <TripsContent />
      </div>
    </AuthGuard>
  );
}
