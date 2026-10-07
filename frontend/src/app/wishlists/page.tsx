"use client";

import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';

export const dynamic = 'force-dynamic';

export default function WishlistsPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-white text-[#222222] flex flex-col font-sans">
      <Suspense fallback={<div className="h-20 bg-white" />}>
        <Header />
      </Suspense>

      <main className="flex-1 max-w-[1780px] w-full mx-auto px-6 sm:px-10 lg:px-16 py-10">
        <div className="border-b border-neutral-200 pb-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#222222]">Wishlists</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {wishlist.length} saved {wishlist.length === 1 ? 'stay' : 'stays'} for your future trips
            </p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-semibold hover:border-black transition"
          >
            Explore more places
          </Link>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
            {wishlist.map((item) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                location={item.location}
                pricePerNight={item.pricePerNight}
                rating={item.rating || 4.95}
                propertyType={item.propertyType}
                imageUrl={item.imageUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-2xl">
              ❤️
            </div>
            <h2 className="text-xl font-bold text-neutral-900">No saves yet</h2>
            <p className="text-sm text-neutral-500">
              As you search, tap the heart icon on any listing card to save your favourite places to your wishlist.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Start exploring
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
