"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ListingCard from './ListingCard';
import InteractiveMap from './InteractiveMap';

interface HomeExploreViewProps {
  listings: any[];
  topTitle: string;
  topSubtitle?: string;
  bottomTitle: string;
  showTaxes: boolean;
  badgeLabel: string;
  priceLabel: string;
  hasActiveFilters: boolean;
  type: string;
  resolvedSearchParams: any;
}

export default function HomeExploreView({
  listings,
  topTitle,
  topSubtitle,
  bottomTitle,
  showTaxes,
  badgeLabel,
  priceLabel,
  hasActiveFilters,
  type,
  resolvedSearchParams,
}: HomeExploreViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const totalCount = listings.length;
  const currentListings = listings.slice(0, visibleCount);
  const hasMore = visibleCount < totalCount;

  const topListings = currentListings.slice(0, Math.min(6, currentListings.length));
  const bottomListings = currentListings.slice(6);

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, totalCount));
  };

  return (
    <>
      {/* View Mode Header Bar (when items are available) */}
      {listings && listings.length > 0 && (
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222] flex items-center gap-2">
              <span>{topTitle}</span>
            </h2>
            {topSubtitle && <p className="text-sm text-neutral-500 mt-0.5">{topSubtitle}</p>}
          </div>

          <div className="flex items-center gap-2.5">
            {hasActiveFilters && (
              <Link
                href="/"
                className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-semibold text-neutral-800 hover:border-black hover:bg-neutral-50 transition flex items-center gap-2 shadow-xs shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear all filters</span>
              </Link>
            )}

            {/* View Switcher Button (Grid vs Map) */}
            {type !== 'Services' && (
              <button
                type="button"
                onClick={() => setViewMode(prev => prev === 'grid' ? 'map' : 'grid')}
                className="px-4 py-2 rounded-full border border-neutral-800 bg-white hover:bg-neutral-900 hover:text-white text-neutral-900 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>{viewMode === 'grid' ? '🗺️' : '📋'}</span>
                <span>{viewMode === 'grid' ? 'Map view' : 'List view'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* RENDER CONTENT */}
      {listings.length === 0 ? (
        <div className="text-center py-20 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">No exact matches found</h3>
          <p className="text-sm text-neutral-500">
            Try searching one of these popular destinations with available stays:
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {[
              { name: "New Delhi", icon: "🏙️" },
              { name: "Mumbai", icon: "🌆" },
              { name: "North Goa", icon: "🏝️" },
              { name: "Varanasi", icon: "🏛️" },
              { name: "Bhopal", icon: "🏖️" },
              { name: "Jaipur", icon: "🏰" },
              { name: "Manali", icon: "🏔️" },
              { name: "Udaipur", icon: "⛵" },
              { name: "Munnar", icon: "🌿" }
            ].map((dest) => (
              <Link
                key={dest.name}
                href={`/?location=${encodeURIComponent(dest.name)}`}
                className="px-4 py-2 border border-neutral-300 rounded-full text-xs font-semibold text-neutral-800 hover:border-black hover:bg-neutral-50 transition flex items-center gap-1.5"
              >
                <span>{dest.icon}</span>
                <span>{dest.name}</span>
              </Link>
            ))}
          </div>
          <div className="pt-3">
            <Link href="/" className="inline-block px-6 py-2.5 bg-[#222222] text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition">
              View all listings
            </Link>
          </div>
        </div>
      ) : viewMode === 'map' ? (
        /* MAP VIEW */
        <div className="mb-16">
          <InteractiveMap listings={listings} />
        </div>
      ) : (
        /* GRID VIEW */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10 mb-14">
            {topListings.map((item: any) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                location={item.location}
                pricePerNight={showTaxes ? Math.round(item.price_per_night * 5) : item.price_per_night}
                rating={item.rating || 4.95}
                propertyType={item.property_type}
                imageUrl={item.images?.[0]?.image_url || item.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"}
                badgeText={badgeLabel}
                priceLabel={priceLabel}
              />
            ))}
          </div>

          {bottomListings && bottomListings.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222]">
                    {bottomTitle}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10 mb-16">
                {bottomListings.map((item: any) => (
                  <ListingCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    location={item.location}
                    pricePerNight={showTaxes ? Math.round(item.price_per_night * 5) : item.price_per_night}
                    rating={item.rating || 4.95}
                    propertyType={item.property_type}
                    imageUrl={item.images?.[0]?.image_url || item.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"}
                    badgeText={badgeLabel}
                    priceLabel={priceLabel}
                  />
                ))}
              </div>
            </>
          )}

          {/* PAGINATION / SHOW MORE CONTROLS */}
          <div className="flex flex-col items-center justify-center my-12 space-y-4">
            <p className="text-xs font-semibold text-neutral-500">
              Showing {currentListings.length} of {totalCount} stays
            </p>
            {/* Progress Bar */}
            <div className="w-48 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((currentListings.length / totalCount) * 100))}%` }}
              />
            </div>
            {hasMore ? (
              <button
                type="button"
                onClick={handleShowMore}
                className="px-8 py-3 bg-neutral-900 hover:bg-black text-white rounded-xl text-sm font-bold transition shadow-sm hover:scale-102 active:scale-98"
              >
                Show more places
              </button>
            ) : (
              <div className="text-xs text-neutral-400 font-medium">
                ✓ All available places loaded
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Center Pill: Toggle Map & Taxes */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 select-none">
        {type !== 'Services' && (
          <button
            type="button"
            onClick={() => setViewMode(prev => prev === 'grid' ? 'map' : 'grid')}
            className="shadow-xl bg-neutral-900 hover:bg-black text-white border border-neutral-700 rounded-full px-5 py-3 flex items-center gap-2 font-semibold text-sm hover:scale-105 active:scale-95 transition duration-200 cursor-pointer"
          >
            <span>{viewMode === 'grid' ? '🗺️' : '📋'}</span>
            <span>{viewMode === 'grid' ? 'Show map' : 'Show list'}</span>
          </button>
        )}

        <Link
          href={`/?${new URLSearchParams({ ...(resolvedSearchParams || {}), taxes: showTaxes ? '0' : '1' }).toString()}`}
          className="shadow-lg bg-white border border-neutral-300 rounded-full px-5 py-3 flex items-center gap-2 font-semibold text-sm hover:shadow-xl hover:scale-105 active:scale-95 transition duration-200 cursor-pointer text-neutral-900"
        >
          <span className="text-[#FF385C]">🏷️</span>
          <span>{showTaxes ? 'Per night' : 'Total fees'}</span>
        </Link>
      </div>
    </>
  );
}
