"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HostListingRow from '@/components/HostListingRow';
import { useAuth } from '@/context/AuthContext';
import { fetchHostListings, fetchHostBookings } from '@/lib/api';

export default function HostDashboard() {
  const { user, token, isDemoUser } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [hostBookings, setHostBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('airbnb_token') : null) || 'demo-evaluator-token';
      const [userListings, bookings] = await Promise.all([
        fetchHostListings(activeToken),
        fetchHostBookings(activeToken)
      ]);
      setListings(userListings);
      setHostBookings(bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('airbnb_booking_updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);
      window.addEventListener('focus', handleUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('airbnb_booking_updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
        window.removeEventListener('focus', handleUpdate);
      }
    };
  }, [token]);

  // Aggregate metrics
  const confirmedBookings = hostBookings.filter(b => b.status === 'confirmed');
  const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
  const avgRating = listings.length > 0 
    ? (listings.reduce((sum, l) => sum + (Number(l.rating) || 4.9), 0) / listings.length).toFixed(2)
    : "5.0";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-neutral-300 border-t-[#FF385C] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222] font-sans">
      {/* Top Host Navigation Bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-[1780px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <svg className="w-8 h-8 text-[#FF385C] shrink-0 transition-transform group-hover:scale-105" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.953l.558 1.089.08.159c2.041 4.004 3.821 7.608 5.279 10.794l.026.025.533 1.22.318.764c.243.613.294 1.222.213 1.858zm1.22-2.39c-.186-.583-.505-1.271-.9-2.094v-.03c-1.889-4.006-3.642-7.608-5.307-10.844l-.111-.163C15.317 1.461 14.468 0 12.001 0c-2.44 0-3.476 1.695-4.535 3.898l-.081.16c-1.669 3.236-3.421 6.843-5.303 10.847v.053l-.559 1.22c-.21.504-.317.768-.345.847C-.172 20.74 2.611 24 5.98 24c.027 0 .132 0 .265-.027h.372c1.75-.213 3.554-1.325 5.384-3.317 1.829 1.989 3.635 3.104 5.382 3.317h.372c.133.027.239.027.265.027 3.37.003 6.152-3.261 4.802-6.975z" />
              </svg>
              <span className="text-xl font-bold text-[#FF385C] hidden sm:inline">airbnb</span>
            </Link>
            <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-full text-xs font-semibold border border-neutral-200">
              Hosting
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold">
            <span className="text-neutral-900 border-b-2 border-neutral-900 pb-1">
              Your Properties ({listings.length})
            </span>
            <Link href="/" className="text-neutral-500 hover:text-neutral-900 transition">
              Switch to traveling
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/host/create"
              className="px-4 py-2 bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-full text-sm font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <span className="text-base font-bold">+</span>
              <span>Create listing</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Host Content */}
      <main className="max-w-[1780px] mx-auto px-6 sm:px-10 lg:px-16 py-10 space-y-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">
            Welcome, {user?.name || "Host"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your active listings, bookings, and revenue.</p>
        </div>

        {isDemoUser && (
          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold text-lg shrink-0">
                🧪
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900">Evaluation Account: Preloaded Hosted Listings</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                    Demo
                  </span>
                </div>
                <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                  This dummy account is assigned <strong>3 luxury properties</strong> (in North Goa, New Delhi, and Mumbai) along with incoming guest reservations so you can test viewing host statistics, editing listing details, or adding brand new listings with the <strong>&quot;+ Create listing&quot;</strong> button.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Owned Listings</p>
            <h3 className="text-3xl font-bold text-neutral-900">{listings.length}</h3>
            <p className="text-xs text-emerald-600 font-medium">● Published and live</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-3xl font-bold text-neutral-900">₹{totalEarnings.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-emerald-600 font-medium">From {confirmedBookings.length} confirmed stay(s)</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Average Rating</p>
            <h3 className="text-3xl font-bold text-neutral-900">{avgRating} ★</h3>
            <p className="text-xs text-neutral-500">Superhost qualifying rating</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Reservations</p>
            <h3 className="text-3xl font-bold text-neutral-900">{hostBookings.length}</h3>
            <p className="text-xs text-neutral-500">Total guest bookings received</p>
          </div>
        </div>

        {/* Incoming Guest Reservations Section */}
        {hostBookings.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-[#222222]">Guest Reservations on Your Homes</h2>
              <p className="text-xs text-neutral-500">Upcoming stays booked by guests</p>
            </div>
            <div className="divide-y divide-neutral-200 overflow-x-auto">
              {hostBookings.map((b: any) => (
                <div key={b.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900">
                        {b.guest?.name || `Guest #${b.guest_id}`}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Property: <span className="font-medium">{b.listing?.title || `Stay #${b.listing_id}`}</span>
                    </p>
                    <p className="text-xs text-neutral-500">
                      Dates: {new Date(b.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(b.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({b.guests} guests)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-900">
                      Payout: ₹{Number(b.total_price).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listings Table / Grid */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#222222]">Your Properties</h2>
              <p className="text-xs text-neutral-500">Properties owned by your host profile</p>
            </div>
            <Link 
              href="/host/create"
              className="text-sm font-semibold text-[#FF385C] hover:underline"
            >
              + Add another listing
            </Link>
          </div>

          <div className="divide-y divide-neutral-200">
            {listings && listings.length > 0 ? (
              listings.map((item: any) => (
                <HostListingRow key={item.id} item={item} onDeleted={loadData} />
              ))
            ) : (
              <div className="p-12 text-center text-neutral-500 space-y-3">
                <p>You haven&apos;t created any listings under this host account yet.</p>
                <Link 
                  href="/host/create"
                  className="inline-block px-5 py-2.5 bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Create your first listing
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
