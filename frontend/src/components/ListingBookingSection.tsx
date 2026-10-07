"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchListingBookedDates, createBooking } from '@/lib/api';
import ReviewsSection from './ReviewsSection';

interface ListingBookingSectionProps {
  listing: any;
}

export default function ListingBookingSection({ listing }: ListingBookingSectionProps) {
  const router = useRouter();
  const { user, token } = useAuth();

  // Selected date range
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  // Calendar month state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  
  // Booked ranges from backend
  const [bookedRanges, setBookedRanges] = useState<{ check_in: string; check_out: string }[]>([]);
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'instant'>('card');

  // Load booked dates on mount
  const loadBookedDates = async () => {
    try {
      const dates = await fetchListingBookedDates(listing.id);
      setBookedRanges(dates);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadBookedDates();
  }, [listing.id]);

  // Strip time for clean date comparisons
  const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = stripTime(new Date());

  const sameDay = (d1: Date, d2: Date) => stripTime(d1).getTime() === stripTime(d2).getTime();

  // Check if a date is in the past
  const isPast = (d: Date) => stripTime(d).getTime() < today.getTime();

  // Check if date falls within a booked range
  const isDateBooked = (d: Date) => {
    const time = stripTime(d).getTime();
    return bookedRanges.some(b => {
      const start = stripTime(new Date(b.check_in)).getTime();
      const end = stripTime(new Date(b.check_out)).getTime();
      return time >= start && time < end;
    });
  };

  // Check if any booked dates overlap between start and end
  const isSpanBooked = (startD: Date, endD: Date) => {
    const s = stripTime(startD).getTime();
    const e = stripTime(endD).getTime();
    return bookedRanges.some(b => {
      const bStart = stripTime(new Date(b.check_in)).getTime();
      const bEnd = stripTime(new Date(b.check_out)).getTime();
      return bStart < e && bEnd > s;
    });
  };

  // Date selection click handler
  const handleDayClick = (d: Date) => {
    setStatus('');
    if (isPast(d) || isDateBooked(d)) return;

    const clicked = stripTime(d);

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clicked);
      setCheckOut(null);
      setHoverDate(null);
    } else if (checkIn && !checkOut) {
      if (clicked.getTime() <= checkIn.getTime()) {
        setCheckIn(clicked);
        setCheckOut(null);
        setHoverDate(null);
      } else {
        // Check if any date in the span is booked
        if (isSpanBooked(checkIn, clicked)) {
          setStatus('Selected dates include already reserved nights. Please pick continuous available dates.');
          setCheckIn(clicked);
          setCheckOut(null);
          setHoverDate(null);
        } else {
          setCheckOut(clicked);
          setHoverDate(null);
        }
      }
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  // Days count calculation
  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const days = calculateDays();
  const pricePerNight = Number(listing.price_per_night) || 0;
  const extraGuests = Math.max(0, guests - 1);
  const extraGuestRatePerNight = Math.round(pricePerNight * 0.15);
  const activeNights = days > 0 ? days : 1;
  const baseTotal = days > 0 ? days * pricePerNight : pricePerNight;
  const extraGuestFee = extraGuests * extraGuestRatePerNight * activeNights;
  const subtotal = baseTotal + extraGuestFee;
  const effectiveNightlyRate = pricePerNight + extraGuests * extraGuestRatePerNight;
  const cleaningFee = Math.floor(pricePerNight * 0.25);
  const serviceFee = Math.floor(subtotal * 0.12);
  const grandTotal = subtotal + cleaningFee + serviceFee;

  // Format dates for display
  const formatDateDisplay = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatMMDDYYYY = (d: Date | null) => {
    if (!d) return '';
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const y = d.getFullYear();
    return `${m}/${day}/${y}`;
  };

  // Cancellation date calculation (1 day prior to check-in)
  const getCancellationDateStr = () => {
    if (checkIn) {
      const cancelDate = new Date(checkIn);
      cancelDate.setDate(cancelDate.getDate() - 1);
      return cancelDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    }
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    return futureDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  };

  // Reserve button clicked
  const handleReserveClick = () => {
    setStatus('');
    if (!checkIn || !checkOut) {
      setStatus('Please select check-in and checkout dates on the calendar.');
      return;
    }
    if (days <= 0) {
      setStatus('Checkout date must be after check-in date.');
      return;
    }
    if (!user) {
      setStatus('Please sign in to reserve this home.');
      return;
    }
    setShowCheckoutModal(true);
  };

  // Confirm booking in database
  const handleConfirmBooking = async () => {
    if (!checkIn || !checkOut) return;
    try {
      setIsLoading(true);
      setStatus('');
      await createBooking({
        listing_id: listing.id,
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        guests: guests,
        cleaning_fee: cleaningFee,
        service_fee: serviceFee
      }, token || undefined);

      setShowCheckoutModal(false);
      setStatus('success');
      // Refresh booked dates so new dates immediately show cut line
      await loadBookedDates();
    } catch (err: any) {
      setStatus(err.message || 'Could not complete reservation.');
      setShowCheckoutModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Render a single calendar month
  const renderCalendarMonth = (offset: number) => {
    const monthDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1);
    const monthTitle = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const startDay = monthDate.getDay();

    return (
      <div className="flex-1 min-w-[280px]">
        {/* Month Header */}
        <div className="text-center font-bold text-base text-neutral-900 mb-6">
          {monthTitle}
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 text-center text-xs text-neutral-500 font-semibold mb-3">
          <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 text-center text-sm gap-y-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dateObj = new Date(monthDate.getFullYear(), monthDate.getMonth(), i + 1);
            const past = isPast(dateObj);
            const booked = isDateBooked(dateObj);
            const unavailable = past || booked;
            const isToday = sameDay(dateObj, today);

            const isStart = Boolean(checkIn && sameDay(dateObj, checkIn));
            const isEnd = Boolean(checkOut && sameDay(dateObj, checkOut));
            const isInRange = Boolean(checkIn && checkOut && dateObj.getTime() > checkIn.getTime() && dateObj.getTime() < checkOut.getTime());

            // Active hover range preview
            const isHoverTarget = Boolean(checkIn && !checkOut && hoverDate && sameDay(dateObj, hoverDate));
            const isInHoverRange = Boolean(
              checkIn && !checkOut && hoverDate && 
              hoverDate.getTime() > checkIn.getTime() && 
              dateObj.getTime() > checkIn.getTime() && 
              dateObj.getTime() < hoverDate.getTime() &&
              !isSpanBooked(checkIn, hoverDate)
            );

            const hasActiveSpan = isInRange || isInHoverRange;

            return (
              <div 
                key={i} 
                className="relative h-10 flex items-center justify-center"
                onMouseEnter={() => {
                  if (checkIn && !checkOut && !unavailable && dateObj.getTime() > checkIn.getTime()) {
                    setHoverDate(dateObj);
                  }
                }}
              >
                {/* Highlight Span Effect connecting start, span, and end */}
                {hasActiveSpan && (
                  <div className="absolute inset-0 bg-[#F7F7F7]" />
                )}
                {isStart && checkIn && (checkOut || (hoverDate && hoverDate.getTime() > checkIn.getTime() && !isSpanBooked(checkIn, hoverDate))) && (
                  <div className="absolute inset-y-0 right-0 left-1/2 bg-[#F7F7F7]" />
                )}
                {isEnd && checkIn && (
                  <div className="absolute inset-y-0 left-0 right-1/2 bg-[#F7F7F7]" />
                )}
                {isHoverTarget && !checkOut && checkIn && (
                  <div className="absolute inset-y-0 left-0 right-1/2 bg-[#F7F7F7]" />
                )}

                {/* Day Button */}
                <button
                  type="button"
                  disabled={unavailable}
                  onClick={() => handleDayClick(dateObj)}
                  className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition ${
                    unavailable
                      ? 'cursor-not-allowed pointer-events-none'
                      : isStart || isEnd
                        ? 'bg-[#222222] text-white shadow-xs'
                        : isHoverTarget
                          ? 'border-2 border-black text-neutral-900 font-bold'
                          : hasActiveSpan
                            ? 'text-neutral-900 font-semibold hover:border hover:border-black'
                            : isToday
                              ? 'border border-neutral-400 text-neutral-900 hover:border-black cursor-pointer'
                              : 'text-neutral-900 hover:border hover:border-black cursor-pointer'
                  }`}
                >
                  {booked ? (
                    <span className="line-through text-neutral-400 decoration-neutral-600 decoration-[1.5px]">
                      {i + 1}
                    </span>
                  ) : past ? (
                    <span className="text-neutral-300 line-through decoration-neutral-300">
                      {i + 1}
                    </span>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Extract city/destination name from listing.location
  const locationCity = listing.location ? listing.location.split(',')[0].trim() : 'Destination';

  return (
    <>
      {/* Sub-Navbar Anchor Bar */}
      <div className="flex gap-8 text-sm font-semibold text-neutral-800 border-b border-neutral-200 pb-4 mb-8 sticky top-20 bg-white z-20">
        <a href="#photos" className="hover:text-black">Photos</a>
        <a href="#amenities" className="hover:text-black">Amenities</a>
        <a href="#reviews" className="hover:text-black">Reviews</a>
        <a href="#location" className="hover:text-black">Location</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
        {/* Left Column (Details + Calendar + Reviews) */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Host Overview */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#222222]">
                Entire {listing.property_type || "home"} hosted by {listing.host?.name || "Verified Host"}
              </h2>
              <p className="text-sm text-[#717171] mt-1">
                {listing.max_guests} guests · 3 bedrooms · 3 beds · 3 private baths
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF385C] to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {(listing.host?.name || "H").charAt(0)}
            </div>
          </div>

          {/* Key Highlights */}
          <div className="space-y-5 pb-6 border-b border-neutral-200">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#222222] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <div>
                <h3 className="font-semibold text-[15px] text-[#222222]">Dedicated host &amp; Superhost</h3>
                <p className="text-sm text-[#717171]">Superhosts are experienced, highly rated hosts committed to great stays.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#222222] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <div>
                <h3 className="font-semibold text-[15px] text-[#222222]">Self check-in</h3>
                <p className="text-sm text-[#717171]">Check yourself in with the smart keypad lock upon arrival.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#222222] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <div>
                <h3 className="font-semibold text-[15px] text-[#222222]">Free cancellation for 48 hours</h3>
                <p className="text-sm text-[#717171]">Get a full refund if you change your plans up to 48 hours before check-in.</p>
              </div>
            </div>
          </div>

          {/* AirCover Badge */}
          <div className="pb-6 border-b border-neutral-200 space-y-2">
            <div className="flex items-center gap-1 text-xl font-bold">
              <span className="text-[#FF385C]">air</span>
              <span className="text-[#222222]">cover</span>
            </div>
            <p className="text-sm text-[#717171] leading-relaxed">
              Every booking includes free protection from Host cancellations, listing inaccuracies, and other issues like trouble checking in.
            </p>
          </div>

          {/* Description */}
          <div className="pb-6 border-b border-neutral-200 space-y-3">
            <h3 className="text-lg font-bold text-[#222222]">About this space</h3>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities Section */}
          <div id="amenities" className="pb-8 border-b border-neutral-200 space-y-4">
            <h3 className="text-lg font-bold text-[#222222]">What this place offers</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-neutral-800">
              {listing.amenities && listing.amenities.length > 0 ? (
                listing.amenities.map((a: any) => (
                  <div key={a.id || a.name} className="flex items-center gap-3">
                    <span className="text-xl">✨</span>
                    <span>{a.name}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-3"><span className="text-xl">📶</span><span>Fast wifi (250 Mbps)</span></div>
                  <div className="flex items-center gap-3"><span className="text-xl">🏊</span><span>Private swimming pool</span></div>
                  <div className="flex items-center gap-3"><span className="text-xl">🍳</span><span>Fully equipped modern kitchen</span></div>
                  <div className="flex items-center gap-3"><span className="text-xl">🚗</span><span>Free secure parking on premises</span></div>
                  <div className="flex items-center gap-3"><span className="text-xl">❄️</span><span>Central air conditioning</span></div>
                  <div className="flex items-center gap-3"><span className="text-xl">🏖️</span><span>Beachfront / direct beach access</span></div>
                </>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* DUAL-MONTH CALENDAR SECTION (MATCHING SCREENSHOT)         */}
          {/* ========================================================= */}
          <div className="pb-10 border-b border-neutral-200 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#222222]">
                {days > 0 ? `${days} nights in ${locationCity}` : `Select check-in date`}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {checkIn && checkOut
                  ? `${formatDateDisplay(checkIn)} - ${formatDateDisplay(checkOut)}`
                  : 'Add your travel dates for exact pricing'
                }
              </p>
            </div>

            {/* Calendar Container */}
            <div className="relative pt-2">
              {/* Previous Month Button (on Left of Month 1) */}
              <button
                type="button"
                onClick={handlePrevMonth}
                className="absolute left-0 top-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 transition z-20 cursor-pointer"
                aria-label="Previous month"
              >
                <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Next Month Button (on Right of Month 2) */}
              <button
                type="button"
                onClick={handleNextMonth}
                className="absolute right-0 top-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 transition z-20 cursor-pointer"
                aria-label="Next month"
              >
                <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              {/* Side-by-side Dual Months */}
              <div className="flex flex-col md:flex-row gap-8 lg:gap-12 justify-between">
                {renderCalendarMonth(0)}
                {renderCalendarMonth(1)}
              </div>
            </div>

            {/* Calendar Bottom Bar */}
            <div className="flex items-center justify-between pt-4">
              <button 
                type="button"
                className="p-2 text-neutral-800 hover:bg-neutral-100 rounded-lg transition"
                title="Keyboard shortcuts"
              >
                <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6zM6.75 7.5v.008h.008V7.5H6.75zm3 0v.008h.008V7.5H9.75zm3 0v.008h.008V7.5h-.008zm3 0v.008h.008V7.5H15.75zm-9 3v.008h.008V10.5H6.75zm3 0v.008h.008V10.5H9.75zm3 0v.008h.008V10.5h-.008zm3 0v.008h.008V10.5H15.75zm-9 3v.008h.008V13.5H6.75zm10.5 0v.008h.008V13.5h-.008zm-7.5 3h6v.008h-6V16.5z" />
                </svg>
              </button>

              <button 
                type="button"
                onClick={() => { setCheckIn(null); setCheckOut(null); setHoverDate(null); setStatus(''); }}
                className="text-xs font-bold underline text-neutral-800 hover:text-black transition cursor-pointer"
              >
                Clear dates
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <div id="reviews" className="scroll-mt-24">
            <ReviewsSection 
              listingId={listing.id}
              initialReviews={listing.reviews || []}
              rating={listing.rating}
              reviewCount={listing.review_count}
            />
          </div>

          {/* Location Section */}
          <div id="location" className="pb-10 border-b border-neutral-200 space-y-4 scroll-mt-24">
            <h3 className="text-xl font-bold text-[#222222]">Where you&apos;ll be</h3>
            <p className="text-sm font-medium text-neutral-700">{listing.location}</p>
            <div className="w-full h-72 rounded-2xl bg-neutral-100 overflow-hidden relative border border-neutral-200 shadow-inner flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
                alt="Map preview" 
                className="w-full h-full object-cover filter brightness-95"
              />
              <div className="absolute p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-[#FF385C] text-white flex items-center justify-center font-bold text-sm shadow">
                  📍
                </span>
                <div>
                  <p className="text-xs font-bold text-neutral-900">{listing.location}</p>
                  <p className="text-[11px] text-neutral-500">Exact location provided after booking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Host Info & Messaging Section */}
          <div className="pb-10 border-b border-neutral-200 space-y-4">
            <h3 className="text-xl font-bold text-[#222222]">Meet your Host</h3>
            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#FF385C] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
                  {(listing.host?.name || "H").charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-neutral-900">{listing.host?.name || "Verified Superhost"}</h4>
                  <p className="text-xs text-neutral-500">★ Superhost • Identity Verified • Fast response rate</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => alert("💬 Guest-to-Host Messaging: Coming Soon!\nDirect messaging between guests and hosts is currently in progress.")}
                className="px-5 py-2.5 rounded-xl border border-neutral-800 text-xs font-semibold hover:bg-neutral-100 transition text-center shrink-0"
              >
                Message Host
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: STICKY BOOKING CARD (MATCHING SCREENSHOT)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-4">
            
            {/* Top Pill Callout */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 flex items-center gap-3">
              <span className="text-xl">💎</span>
              <p className="text-xs font-bold text-neutral-800">
                Rare find! This place is usually booked
              </p>
            </div>

            {/* Main Reservation Card */}
            <div className="rounded-3xl border border-neutral-200/90 shadow-[0_6px_20px_rgba(0,0,0,0.12)] p-6 sm:p-7 bg-white space-y-5">
              
              {/* Header Price */}
              <div className="flex items-baseline justify-between">
                <div>
                  {days > 0 ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-[#222222] underline underline-offset-4 decoration-neutral-300">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm font-medium text-neutral-600">for {days} {days === 1 ? 'night' : 'nights'}</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-[#222222]">
                        ₹{effectiveNightlyRate.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm font-medium text-neutral-600">night</span>
                      {extraGuests > 0 && (
                        <span className="text-[11px] text-neutral-500 font-normal ml-1">({guests} guests)</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-sm font-semibold text-neutral-800">
                  <svg className="w-3.5 h-3.5 fill-[#222222]" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span>{listing.rating ? Number(listing.rating).toFixed(2) : "4.95"}</span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-neutral-500 underline">{listing.review_count || 120} reviews</span>
                </div>
              </div>

              {/* Boxed Inputs (Check-in, Checkout, Guests) */}
              <div className="rounded-2xl border border-neutral-400/80 overflow-hidden text-left bg-white">
                <div className="grid grid-cols-2 divide-x divide-neutral-400/80 border-b border-neutral-400/80">
                  <div className="p-3 bg-white">
                    <label className="block text-[10px] font-extrabold tracking-wider uppercase text-neutral-900">
                      CHECK-IN
                    </label>
                    <div className="text-xs font-semibold text-neutral-800 mt-0.5">
                      {checkIn ? formatMMDDYYYY(checkIn) : 'Add date'}
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <label className="block text-[10px] font-extrabold tracking-wider uppercase text-neutral-900">
                      CHECKOUT
                    </label>
                    <div className="text-xs font-semibold text-neutral-800 mt-0.5">
                      {checkOut ? formatMMDDYYYY(checkOut) : 'Add date'}
                    </div>
                  </div>
                </div>

                {/* Guests dropdown */}
                <div className="relative">
                  <div 
                    onClick={() => setIsGuestsOpen(!isGuestsOpen)}
                    className="p-3 bg-white flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition"
                  >
                    <div>
                      <label className="block text-[10px] font-extrabold tracking-wider uppercase text-neutral-900">
                        GUESTS
                      </label>
                      <div className="text-xs font-semibold text-neutral-800 mt-0.5">
                        {guests} {guests === 1 ? 'guest' : 'guests'}
                      </div>
                    </div>
                    <svg className={`w-4 h-4 text-neutral-600 transition-transform ${isGuestsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>

                  {isGuestsOpen && (
                    <div className="p-4 bg-white border-t border-neutral-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800">Total Guests</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            disabled={guests <= 1}
                            className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center font-bold text-neutral-600 hover:border-black disabled:opacity-30"
                          >-</button>
                          <span className="text-xs font-bold">{guests}</span>
                          <button
                            type="button"
                            onClick={() => setGuests(Math.min(listing.max_guests || 10, guests + 1))}
                            disabled={guests >= (listing.max_guests || 10)}
                            className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center font-bold text-neutral-600 hover:border-black disabled:opacity-30"
                          >+</button>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-500">Maximum {listing.max_guests || 6} guests allowed.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Free Cancellation Banner */}
              <div className="py-2.5 px-3 bg-neutral-100 rounded-xl text-center text-xs font-medium text-neutral-700">
                Free cancellation before {getCancellationDateStr()}
              </div>

              {/* Reserve Button */}
              <button 
                type="button"
                onClick={handleReserveClick} 
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#FF385C] via-[#E00B41] to-[#D70466] shadow-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Reserve'}
              </button>

              {/* Feedback messages */}
              {status === 'success' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <p className="text-sm font-bold text-emerald-800">🎉 Reservation Confirmed!</p>
                  <p className="text-xs text-emerald-600">The dates are permanently locked in the database.</p>
                  <Link
                    href="/trips"
                    className="inline-block mt-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    View in My Trips →
                  </Link>
                </div>
              ) : status ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                  <p className="text-xs font-medium text-red-600">{status}</p>
                  {!user && (
                    <Link 
                      href="/login" 
                      className="inline-block mt-1.5 text-xs font-bold text-[#FF385C] hover:underline"
                    >
                      Sign In to Book
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-center text-xs text-neutral-500">
                  You won&apos;t be charged yet
                </p>
              )}

              {/* Detailed Price Breakdown */}
              <div className="pt-2 space-y-3 text-sm text-neutral-700">
                <div className="flex justify-between items-center">
                  <span className="underline cursor-pointer">
                    ₹{pricePerNight.toLocaleString('en-IN')} × {days > 0 ? days : 1} {days === 1 ? 'night' : 'nights'}
                  </span>
                  <span>₹{baseTotal.toLocaleString('en-IN')}</span>
                </div>
                {extraGuests > 0 && (
                  <div className="flex justify-between items-center text-neutral-800">
                    <span className="underline cursor-pointer">
                      Extra guest fee ({extraGuests} {extraGuests === 1 ? 'guest' : 'guests'} × {activeNights} {activeNights === 1 ? 'night' : 'nights'})
                    </span>
                    <span>₹{extraGuestFee.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="underline cursor-pointer">Cleaning fee</span>
                  <span>₹{cleaningFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="underline cursor-pointer">Airbnb service fee</span>
                  <span>₹{serviceFee.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="pt-4 border-t border-neutral-200 flex justify-between items-center text-base font-bold text-neutral-900">
                  <span>Total before taxes</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Report Listing */}
            <button 
              type="button" 
              onClick={() => alert('Listing reported for review.')}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-black mx-auto pt-2 transition cursor-pointer"
            >
              <span>🚩</span>
              <span className="underline">Report this listing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation & Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Confirm &amp; Pay</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Airbnb Mocked Checkout</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Trip details */}
            <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Property:</span>
                <span className="font-semibold text-neutral-800 text-right max-w-[240px] truncate">{listing.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Dates:</span>
                <span className="font-semibold text-neutral-800">{formatDateDisplay(checkIn)} → {formatDateDisplay(checkOut)} ({days} nights)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Guests:</span>
                <span className="font-semibold text-neutral-800">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-base text-neutral-900">
                <span>Total Due:</span>
                <span className="text-[#FF385C]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Payment Option (Simulated)
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center font-medium transition cursor-pointer ${
                    paymentMethod === 'card' ? 'border-black bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                  }`}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-center font-medium transition cursor-pointer ${
                    paymentMethod === 'upi' ? 'border-black bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                  }`}
                >
                  📱 UPI / GPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('instant')}
                  className={`p-3 rounded-xl border text-center font-medium transition cursor-pointer ${
                    paymentMethod === 'instant' ? 'border-black bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                  }`}
                >
                  ⚡ Instant
                </button>
              </div>
            </div>

            <div className="text-xs text-neutral-500">
              Reserving as <span className="font-semibold text-neutral-800">{user?.name}</span> ({user?.email}). Dates will be automatically locked in the database.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-3 text-sm font-semibold rounded-xl border border-neutral-300 hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isLoading}
                className="flex-1 py-3 text-sm font-semibold text-white bg-[#FF385C] hover:bg-[#E00B41] rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Processing...' : 'Confirm & Reserve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
