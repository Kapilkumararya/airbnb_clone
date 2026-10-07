"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export interface ListingCardProps {
  id?: number | string;
  title: string;
  location: string;
  pricePerNight: number;
  rating: number;
  imageUrl: string;
  propertyType?: string;
  dates?: string;
  badgeText?: string;
  priceLabel?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80";

export default function ListingCard({
  id,
  title,
  location,
  pricePerNight,
  rating,
  imageUrl,
  propertyType,
  dates = "Nov 12 – 17",
  badgeText = "Guest favourite",
  priceLabel = "night"
}: ListingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imgSrc, setImgSrc] = useState(imageUrl || FALLBACK_IMAGE);

  // Sync if imageUrl prop updates
  React.useEffect(() => {
    setImgSrc(imageUrl || FALLBACK_IMAGE);
  }, [imageUrl]);

  return (
    <div className="group block relative">
      <Link href={`/listing/${id}`} className="block">
        {/* Card Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
          <img 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
            src={imgSrc} 
            onError={() => {
              if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
            }}
            loading="lazy"
          />
          
          {/* Badge */}
          {badgeText && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold shadow-sm text-neutral-800 tracking-tight flex items-center gap-1.5">
              {badgeText === 'Original' && <span className="text-[10px]">✨</span>}
              {badgeText}
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="mt-3 space-y-0.5">
          <div className="flex justify-between items-baseline gap-2">
            <h3 className="font-semibold text-[15px] text-[#222222] truncate leading-snug">
              {title}
            </h3>
            <div className="flex items-center gap-1 text-[14px] font-medium text-[#222222] shrink-0">
              <svg className="w-3.5 h-3.5 fill-[#222222]" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span>{rating ? rating.toFixed(2) : "4.95"}</span>
            </div>
          </div>
          
          <p className="text-[14px] text-[#717171] truncate">
            {location}
          </p>
          <p className="text-[14px] text-[#717171]">
            {dates}
          </p>
          <p className="text-[15px] text-[#222222] pt-1">
            {priceLabel === 'night' ? (
              <>
                <span className="font-semibold">₹{Number(pricePerNight).toLocaleString('en-IN')}</span>
                <span className="font-normal text-neutral-600"> night</span>
              </>
            ) : priceLabel === 'total before taxes' ? (
              <>
                <span className="font-semibold">₹{Number(pricePerNight).toLocaleString('en-IN')}</span>
                <span className="font-normal text-neutral-600"> total before taxes</span>
              </>
            ) : (
              <>
                <span className="font-normal text-neutral-600">From </span>
                <span className="font-semibold">₹{Number(pricePerNight).toLocaleString('en-IN')}</span>
                <span className="font-normal text-neutral-600"> / {priceLabel}</span>
              </>
            )}
          </p>
        </div>
      </Link>

      {/* Heart Wishlist Button (prevent link navigation) */}
      <button 
        aria-label="Save to Wishlist" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        className="absolute top-3 right-3 p-2 text-white hover:scale-115 active:scale-90 transition z-10"
      >
        <svg 
          className={`w-6 h-6 drop-shadow-md transition-colors ${
            isLiked 
              ? 'fill-[#FF385C] stroke-[#FF385C]' 
              : 'fill-black/30 stroke-white stroke-[2]'
          }`} 
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>
  );
}
