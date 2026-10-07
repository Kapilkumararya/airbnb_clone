"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchListingBookedDates, createBooking } from '@/lib/api';

export interface BookingWidgetProps {
  listingId: number;
  listingTitle?: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
}

export default function BookingWidget({
  listingId,
  listingTitle = "Selected Stay",
  pricePerNight,
  rating,
  reviewCount
}: BookingWidgetProps) {
  const router = useRouter();
  const { user, token } = useAuth();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [bookedRanges, setBookedRanges] = useState<{ check_in: string; check_out: string }[]>([]);

  // Load booked dates to prevent duplicate reservations
  useEffect(() => {
    async function loadBooked() {
      const dates = await fetchListingBookedDates(listingId);
      setBookedRanges(dates);
    }
    loadBooked();
  }, [listingId]);

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime <= 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays();
  const activeNights = days > 0 ? days : 5;
  const baseTotal = days > 0 ? days * pricePerNight : pricePerNight * 5;
  const cleaningFee = Math.floor(pricePerNight * 0.25);
  const serviceFee = Math.floor(baseTotal * 0.12);
  const grandTotal = baseTotal + cleaningFee + serviceFee;

  // Check if chosen range overlaps any booked range
  const hasOverlap = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return false;
    const s = new Date(startStr).getTime();
    const e = new Date(endStr).getTime();
    return bookedRanges.some(b => {
      const bs = new Date(b.check_in).getTime();
      const be = new Date(b.check_out).getTime();
      return s < be && e > bs;
    });
  };

  const handleOpenCheckout = () => {
    setStatus('');
    if (!checkIn || !checkOut) {
      setStatus('Please select both check-in and checkout dates.');
      return;
    }
    if (days <= 0) {
      setStatus('Checkout date must be after check-in date.');
      return;
    }
    if (hasOverlap(checkIn, checkOut)) {
      setStatus('The selected date span is unavailable (already booked). Please choose other dates.');
      return;
    }
    if (!user) {
      setStatus('Please sign in or create an account to reserve this home.');
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleConfirmReservation = async () => {
    try {
      setIsLoading(true);
      setStatus('');
      await createBooking({
        listing_id: listingId,
        check_in: new Date(checkIn).toISOString(),
        check_out: new Date(checkOut).toISOString(),
        guests: guests,
        cleaning_fee: cleaningFee,
        service_fee: serviceFee
      }, token || undefined);

      setShowCheckoutModal(false);
      setStatus('success');
      // Refresh booked dates
      const updatedDates = await fetchListingBookedDates(listingId);
      setBookedRanges(updatedDates);
    } catch (err: any) {
      setStatus(err.message || 'Could not complete reservation.');
      setShowCheckoutModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Today string for date input min
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-2xl border border-neutral-300 shadow-xl p-6 bg-white sticky top-28">
      {/* Header with price and rating */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="text-2xl font-bold text-[#222222]">
            ₹{Number(pricePerNight).toLocaleString('en-IN')}
          </span>
          <span className="text-sm font-normal text-neutral-600 ml-1">night</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <svg className="w-3.5 h-3.5 fill-[#222222]" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          <span className="font-semibold text-neutral-900">{rating ? rating.toFixed(2) : "4.95"}</span>
          <span className="text-neutral-400">·</span>
          <span className="text-neutral-500 underline cursor-pointer">{reviewCount || 120} reviews</span>
        </div>
      </div>
      
      {/* Date Pickers Container */}
      <div className="rounded-xl border border-neutral-300 overflow-hidden mb-4">
        <div className="grid grid-cols-2 divide-x divide-neutral-300 border-b border-neutral-300">
          <div className="p-3 bg-white hover:bg-neutral-50 transition cursor-pointer">
            <label className="block text-[10px] font-extrabold tracking-wider uppercase text-neutral-800">
              CHECK-IN
            </label>
            <input 
              type="date" 
              min={todayStr}
              className="w-full bg-transparent border-0 p-0 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-0 cursor-pointer" 
              value={checkIn} 
              onChange={e => {
                setCheckIn(e.target.value);
                setStatus('');
              }} 
            />
          </div>
          <div className="p-3 bg-white hover:bg-neutral-50 transition cursor-pointer">
            <label className="block text-[10px] font-extrabold tracking-wider uppercase text-neutral-800">
              CHECKOUT
            </label>
            <input 
              type="date" 
              min={checkIn || todayStr}
              className="w-full bg-transparent border-0 p-0 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-0 cursor-pointer" 
              value={checkOut} 
              onChange={e => {
                setCheckOut(e.target.value);
                setStatus('');
              }} 
            />
          </div>
        </div>
        <div className="p-3 bg-white hover:bg-neutral-50 transition">
          <label className="block text-[10px] font-extrabold tracking-wider uppercase text-neutral-800">
            GUESTS
          </label>
          <select 
            className="w-full bg-transparent border-0 p-0 text-sm font-medium text-neutral-800 focus:outline-none focus:ring-0 cursor-pointer"
            value={guests} 
            onChange={e => setGuests(parseInt(e.target.value) || 1)}
          >
            {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
            ))}
          </select>
        </div>
      </div>

      {bookedRanges.length > 0 && (
        <div className="mb-3 text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
          ℹ️ {bookedRanges.length} date range(s) already reserved for this stay.
        </div>
      )}

      {/* Reserve Button */}
      <button 
        onClick={handleOpenCheckout} 
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#FF385C] via-[#E00B41] to-[#D70466] shadow-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
      >
        {isLoading ? 'Checking...' : 'Reserve'}
      </button>

      {/* Confirmation / Status message */}
      {status === 'success' ? (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
          <p className="text-sm font-bold text-emerald-800">🎉 Reservation Confirmed!</p>
          <p className="text-xs text-emerald-600">Your trip is saved to your account and dates are blocked.</p>
          <Link
            href="/trips"
            className="inline-block mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            View in My Trips →
          </Link>
        </div>
      ) : status ? (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-xs font-medium text-red-600">{status}</p>
          {!user && (
            <Link 
              href="/login" 
              className="inline-block mt-2 text-xs font-bold text-[#FF385C] hover:underline"
            >
              Log in or Sign up now
            </Link>
          )}
        </div>
      ) : (
        <p className="text-center text-xs text-neutral-500 mt-3">
          You won&apos;t be charged yet
        </p>
      )}

      {/* Dynamic Price Breakdown */}
      <div className="mt-6 space-y-3 text-sm text-neutral-700">
        <div className="flex justify-between items-center">
          <span className="underline cursor-pointer">
            ₹{Number(pricePerNight).toLocaleString('en-IN')} × {days > 0 ? days : 5} nights
          </span>
          <span>₹{baseTotal.toLocaleString('en-IN')}</span>
        </div>
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

      {/* Mocked Checkout / Confirmation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Confirm &amp; Pay</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Mocked Airbnb Checkout</p>
              </div>
              <button
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
                <span className="font-semibold text-neutral-800 text-right max-w-[240px] truncate">{listingTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Dates:</span>
                <span className="font-semibold text-neutral-800">{checkIn} → {checkOut} ({days} nights)</span>
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
                  className={`p-3 rounded-xl border text-center font-medium transition ${
                    paymentMethod === 'card' ? 'border-black bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                  }`}
                >
                  💳 Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-center font-medium transition ${
                    paymentMethod === 'upi' ? 'border-black bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                  }`}
                >
                  📱 UPI / GPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('instant')}
                  className={`p-3 rounded-xl border text-center font-medium transition ${
                    paymentMethod === 'instant' ? 'border-black bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                  }`}
                >
                  ⚡ Instant Pay
                </button>
              </div>
            </div>

            {/* Guest details confirmation */}
            <div className="text-xs text-neutral-500 leading-relaxed">
              Reserving as <span className="font-semibold text-neutral-800">{user?.name}</span> ({user?.email}). Dates will be automatically locked in the database.
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-3 text-sm font-semibold rounded-xl border border-neutral-300 hover:bg-neutral-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReservation}
                disabled={isLoading}
                className="flex-1 py-3 text-sm font-semibold text-white bg-[#FF385C] hover:bg-[#E00B41] rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Confirm & Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
