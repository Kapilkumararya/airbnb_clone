"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { deleteListing } from '@/lib/api';

export default function HostListingRow({ item, onDeleted }: { item: any; onDeleted?: () => void }) {
  const router = useRouter();
  const { token } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently remove "${item.title}"?`)) return;
    try {
      setIsDeleting(true);
      await deleteListing(item.id, token || undefined);
      setIsDeleted(true);
      if (onDeleted) onDeleted();
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Could not delete listing.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) return null;

  return (
    <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-neutral-50 transition">
      <div className="flex items-center gap-5">
        <img 
          src={item.images?.[0]?.image_url || item.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80"} 
          alt={item.title} 
          className="w-24 h-20 object-cover rounded-xl border border-neutral-200 shrink-0"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              Active Listing
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-500 font-medium">{item.property_type || "Home"}</span>
          </div>
          <h4 className="text-base font-semibold text-[#222222] mt-0.5">{item.title}</h4>
          <p className="text-xs text-neutral-500">{item.location} · Up to {item.max_guests} guests</p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        <div className="text-right">
          <p className="text-base font-bold text-[#222222]">
            ₹{Number(item.price_per_night).toLocaleString('en-IN')}
            <span className="text-xs font-normal text-neutral-500"> / night</span>
          </p>
          <p className="text-xs text-neutral-400">Rating: {item.rating ? Number(item.rating).toFixed(2) : "New"} ★</p>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            href={`/listing/${item.id}`}
            className="px-3.5 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-800 hover:border-black transition"
          >
            View
          </Link>
          <Link 
            href={`/host/edit/${item.id}`}
            className="px-3.5 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-800 hover:border-black transition"
          >
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3.5 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition disabled:opacity-50"
            title="Delete listing"
          >
            {isDeleting ? '...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
