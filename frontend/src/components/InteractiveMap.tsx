"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface MapListing {
  id: number | string;
  title: string;
  location: string;
  price_per_night: number;
  rating?: number;
  property_type?: string;
  image_url?: string;
  images?: { image_url: string }[];
  latitude?: number;
  longitude?: number;
}

interface InteractiveMapProps {
  listings: MapListing[];
}

// Coordinate mapping for destination hotspots
const LOCATION_COORDS: Record<string, { x: number; y: number }> = {
  "north goa": { x: 38, y: 68 },
  "goa": { x: 38, y: 68 },
  "south goa": { x: 39, y: 70 },
  "new delhi": { x: 42, y: 32 },
  "delhi": { x: 42, y: 32 },
  "gurgaon": { x: 41, y: 34 },
  "mumbai": { x: 34, y: 58 },
  "jaipur": { x: 37, y: 38 },
  "varanasi": { x: 55, y: 41 },
  "bhopal": { x: 46, y: 50 },
  "manali": { x: 43, y: 22 },
  "udaipur": { x: 35, y: 44 },
  "munnar": { x: 44, y: 84 },
  "bengaluru": { x: 43, y: 76 },
  "athens": { x: 25, y: 28 },
  "tokyo": { x: 80, y: 35 },
  "paris": { x: 20, y: 24 },
  "bali": { x: 75, y: 78 }
};

export default function InteractiveMap({ listings }: InteractiveMapProps) {
  const [selectedListing, setSelectedListing] = useState<MapListing | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Position pin according to location match or deterministic hash
  const getPinPosition = (listing: MapListing, index: number) => {
    const locLower = (listing.location || '').toLowerCase();
    for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
      if (locLower.includes(key)) {
        // slight jitter for multiple listings in the same city
        const jitterX = ((index % 5) - 2) * 2.5;
        const jitterY = (Math.floor(index / 5) - 1) * 2.5;
        return {
          left: `${Math.min(92, Math.max(8, coords.x + jitterX))}%`,
          top: `${Math.min(88, Math.max(12, coords.y + jitterY))}%`
        };
      }
    }
    // Fallback spread
    const fallbackX = 25 + ((index * 13) % 55);
    const fallbackY = 25 + ((index * 19) % 50);
    return { left: `${fallbackX}%`, top: `${fallbackY}%` };
  };

  return (
    <div className="relative w-full h-[650px] sm:h-[720px] rounded-3xl overflow-hidden border border-neutral-300 shadow-inner bg-[#EBF0F5] select-none">
      {/* Map Graphic Layer (SVG stylized tiles) */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
        style={{ transform: `scale(${zoomLevel})` }}
        onClick={() => setSelectedListing(null)}
      >
        <svg className="w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D1DCE5" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#E3ECF3" />
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Stylized Coastal Water & Land contours */}
          <path d="M 0,200 Q 150,180 300,240 T 600,320 T 900,280 T 1200,360 T 1600,310 L 1600,900 L 0,900 Z" fill="#D6E5EE" opacity="0.7"/>
          <path d="M 200,0 Q 320,150 280,350 T 360,600 T 320,900" fill="none" stroke="#CBDCE7" strokeWidth="18" opacity="0.6"/>
          <path d="M 0,380 Q 250,340 500,420 T 950,460 T 1500,400" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity="0.8"/>
          <path d="M 450,0 Q 420,280 490,520 T 430,900" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity="0.8"/>
          
          {/* City Landmark labels */}
          <text x="42%" y="30%" fill="#78909C" fontSize="13" fontWeight="bold" letterSpacing="1">NEW DELHI</text>
          <text x="33%" y="56%" fill="#78909C" fontSize="13" fontWeight="bold" letterSpacing="1">MUMBAI</text>
          <text x="37%" y="66%" fill="#78909C" fontSize="13" fontWeight="bold" letterSpacing="1">GOA</text>
          <text x="36%" y="36%" fill="#78909C" fontSize="12" fontWeight="bold" letterSpacing="1">JAIPUR</text>
          <text x="54%" y="39%" fill="#78909C" fontSize="12" fontWeight="bold" letterSpacing="1">VARANASI</text>
          <text x="42%" y="20%" fill="#78909C" fontSize="12" fontWeight="bold" letterSpacing="1">MANALI</text>
          <text x="42%" y="74%" fill="#78909C" fontSize="12" fontWeight="bold" letterSpacing="1">BENGALURU</text>
        </svg>

        {/* Listing Pins */}
        {listings.map((item, idx) => {
          const pos = getPinPosition(item, idx);
          const isSelected = selectedListing?.id === item.id;
          const price = Number(item.price_per_night || 0).toLocaleString('en-IN');

          return (
            <div
              key={item.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-all duration-200"
              style={{ left: pos.left, top: pos.top }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedListing(item);
              }}
            >
              <button
                type="button"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full font-bold text-xs shadow-md transition-all duration-200 ${
                  isSelected
                    ? 'bg-black text-white scale-110 shadow-xl ring-2 ring-white'
                    : 'bg-white text-neutral-900 hover:scale-105 hover:bg-neutral-50 hover:shadow-lg border border-neutral-200'
                }`}
              >
                <span>₹{price}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-1.5">
        <button
          type="button"
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2))}
          className="w-9 h-9 rounded-xl hover:bg-neutral-100 flex items-center justify-center text-neutral-800 font-bold text-lg transition"
          title="Zoom in"
        >
          +
        </button>
        <div className="w-full h-[1px] bg-neutral-200" />
        <button
          type="button"
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
          className="w-9 h-9 rounded-xl hover:bg-neutral-100 flex items-center justify-center text-neutral-800 font-bold text-lg transition"
          title="Zoom out"
        >
          −
        </button>
        <div className="w-full h-[1px] bg-neutral-200" />
        <button
          type="button"
          onClick={() => setZoomLevel(1)}
          className="w-9 h-9 rounded-xl hover:bg-neutral-100 flex items-center justify-center text-xs font-semibold text-neutral-600 transition"
          title="Reset zoom"
        >
          1x
        </button>
      </div>

      {/* Selected Listing Floating Preview Card */}
      {selectedListing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[calc(100vw-36px)] sm:w-[360px] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="relative aspect-[16/10] w-full bg-neutral-100 overflow-hidden">
            <img
              src={selectedListing.images?.[0]?.image_url || selectedListing.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"}
              alt={selectedListing.title}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setSelectedListing(null)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:text-black font-bold text-xs shadow-md"
            >
              ✕
            </button>
            <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-full text-[11px] font-bold text-neutral-800 shadow-sm">
              ★ {selectedListing.rating ? selectedListing.rating.toFixed(2) : '4.95'}
            </div>
          </div>

          <div className="p-4 space-y-1">
            <h4 className="font-semibold text-sm text-neutral-900 truncate">
              {selectedListing.title}
            </h4>
            <p className="text-xs text-neutral-500 truncate">
              {selectedListing.location}
            </p>
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="font-bold text-base text-neutral-900">
                  ₹{Number(selectedListing.price_per_night).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-neutral-500"> / night</span>
              </div>
              <Link
                href={`/listing/${selectedListing.id}`}
                className="px-4 py-2 bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                View stay
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Map Helper Badge */}
      <div className="absolute top-4 left-4 z-30 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-neutral-200 flex items-center gap-2 text-xs font-semibold text-neutral-700">
        <span className="w-2 h-2 rounded-full bg-[#FF385C] animate-pulse" />
        <span>{listings.length} stays with interactive pins</span>
      </div>
    </div>
  );
}
