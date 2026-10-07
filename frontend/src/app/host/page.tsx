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
    if (!token) return;
    try {
      const [userListings, bookings] = await Promise.all([
        fetchHostListings(token),
        fetchHostBookings(token)
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
              <svg className="w-8 h-8 text-[#FF385C] transition-transform group-hover:scale-105" fill="currentColor" viewBox="0 0 32 32">
                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.479.96 3.525.127 2.635-.91 5.093-2.84 6.745C24.78 32.324 22.127 33 19.34 33c-2.316 0-4.434-.567-6.077-1.636l-.377-.258c-.302-.216-.583-.45-.886-.713-.303.263-.584.497-.886.713l-.377.258C8.995 32.433 6.877 33 4.561 33c-2.788 0-5.44-.676-7.31-2.272-1.93-1.652-2.967-4.11-2.84-6.745.05-1.046.293-1.934.96-3.525l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C4.437 1.963 5.892 1 7.9 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c.42.823 1.077 2.148 1.816 3.666.739-1.518 1.396-2.843 1.816-3.666l.533-1.025C18.437 1.963 19.892 1 21.9 1z" />
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
