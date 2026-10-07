"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchListing, updateListing } from '@/lib/api';

export default function EditListingPage() {
  const params = useParams();
  const listingId = Number(params?.id);
  const router = useRouter();
  const { token, user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price_per_night: 0,
    property_type: 'Beachfront',
    max_guests: 4,
    image_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!listingId) return;
      try {
        const item = await fetchListing(listingId);
        if (item) {
          setFormData({
            title: item.title || '',
            description: item.description || '',
            location: item.location || '',
            price_per_night: item.price_per_night || 0,
            property_type: item.property_type || 'Beachfront',
            max_guests: item.max_guests || 4,
            image_url: item.images?.[0]?.image_url || item.image_url || '',
          });
        }
      } catch (err: any) {
        setError('Could not load listing details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [listingId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'price_per_night' || name === 'max_guests' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await updateListing(listingId, formData, token || undefined);
      router.push('/host');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-neutral-300 border-t-[#FF385C] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222] font-sans py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/host" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-black">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-neutral-200">
          <div className="border-b border-neutral-200 pb-6 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">Edit Property Details</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Editing listing #{listingId} · Hosted by {user?.name}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Property Title
              </label>
              <input 
                required 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="w-full p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-sm" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Location
                </label>
                <input 
                  required 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="w-full p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Category
                </label>
                <select 
                  name="property_type" 
                  value={formData.property_type} 
                  onChange={handleChange} 
                  className="w-full p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-sm cursor-pointer"
                >
                  <option value="Beachfront">Beachfront</option>
                  <option value="Amazing views">Amazing views</option>
                  <option value="Cabins">Cabins</option>
                  <option value="Mansions">Mansions</option>
                  <option value="Trending">Trending</option>
                  <option value="OMG!">OMG!</option>
                  <option value="Islands">Islands</option>
                  <option value="Luxe">Luxe</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Price per Night (₹ INR)
                </label>
                <input 
                  required 
                  type="number" 
                  min="500" 
                  name="price_per_night" 
                  value={formData.price_per_night} 
                  onChange={handleChange} 
                  className="w-full p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Maximum Guests
                </label>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  max="20" 
                  name="max_guests" 
                  value={formData.max_guests} 
                  onChange={handleChange} 
                  className="w-full p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-sm" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Primary Image URL
              </label>
              <input 
                required 
                type="url" 
                name="image_url" 
                value={formData.image_url} 
                onChange={handleChange} 
                className="w-full p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-sm" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Description
              </label>
              <textarea 
                required 
                rows={4} 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-sm" 
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => router.back()} 
                className="px-6 py-3 font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="px-8 py-3 font-semibold text-white bg-neutral-900 hover:bg-black rounded-xl shadow-sm transition disabled:opacity-50 text-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
