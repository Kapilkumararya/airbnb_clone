"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createListing } from '@/lib/api';

const AVAILABLE_AMENITIES = [
  "Fast Wifi", "Private Pool", "Fully Equipped Kitchen", "Free Parking",
  "Air Conditioning", "Beachfront Access", "Panoramic Mountain View",
  "Dedicated Workspace", "Hot Tub", "BBQ Grill", "Smart TV with Netflix", "Power Backup"
];

export default function CreateListingPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price_per_night: 8500,
    property_type: 'Beachfront',
    max_guests: 4,
    image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["Fast Wifi", "Air Conditioning", "Free Parking"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'price_per_night' || name === 'max_guests' ? Number(value) : value 
    }));
  };

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev => 
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createListing({
        ...formData,
        amenities: selectedAmenities,
      }, token || undefined);

      router.push('/host');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the listing.');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">List your home on Airbnb</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Hosting as <span className="font-semibold text-neutral-800">{user?.name}</span> ({user?.email})
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
                placeholder="e.g. Luxury Seaview Villa with Private Infinity Pool" 
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
                  placeholder="e.g. North Goa, India" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Category / Property Type
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
                placeholder="https://images.unsplash.com/..." 
              />
              <p className="text-xs text-neutral-400 mt-1">Provide a high-resolution Unsplash or direct image link.</p>
            </div>

            {/* Amenities Checkboxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Amenities &amp; Features
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_AMENITIES.map(amenity => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition ${
                      selectedAmenities.includes(amenity)
                        ? 'border-black bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-white'
                    }`}
                  >
                    <span>{amenity}</span>
                    {selectedAmenities.includes(amenity) && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Description &amp; Highlights
              </label>
              <textarea 
                required 
                rows={4} 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full p-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-sm" 
                placeholder="Describe your space, ambiance, amenities, and nearby attractions..." 
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
                disabled={loading} 
                className="px-8 py-3 font-semibold text-white bg-[#FF385C] hover:bg-[#E00B41] rounded-xl shadow-sm transition disabled:opacity-50 text-sm"
              >
                {loading ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
