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
  });
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [urlInput, setUrlInput] = useState('');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setImages(prev => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddUrl = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setImages(prev => [...prev, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    setImages(prev => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalPrimary = images[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80';

    try {
      await createListing({
        ...formData,
        image_url: finalPrimary,
        images: images.length > 0 ? images : [finalPrimary],
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

            {/* Property Photos: Local Upload + URL Gallery Manager */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Property Photos ({images.length})
                </label>
                <span className="text-xs text-neutral-500 font-medium">First photo will be the main display cover</span>
              </div>

              {/* Upload Box: File picker from device */}
              <div className="border-2 border-dashed border-neutral-300 hover:border-black rounded-2xl p-6 text-center transition bg-neutral-50 hover:bg-neutral-100/50">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  id="listing-photo-upload" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <label htmlFor="listing-photo-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-neutral-200 flex items-center justify-center text-xl">
                    📸
                  </div>
                  <div>
                    <span className="text-sm font-bold text-neutral-900 hover:underline">Upload photos from device</span>
                    <p className="text-xs text-neutral-500 mt-0.5">Click to choose from your gallery or files (PNG, JPG, WEBP)</p>
                  </div>
                  <span className="inline-block px-4 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-full shadow-xs transition">
                    Browse Local Files
                  </span>
                </label>
              </div>

              {/* Or Add Photo via URL */}
              <div className="flex gap-2">
                <input 
                  type="url" 
                  value={urlInput} 
                  onChange={(e) => setUrlInput(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && handleAddUrl(e)}
                  className="flex-1 p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-xs" 
                  placeholder="Or paste an image URL (e.g. Unsplash) and click Add..." 
                />
                <button 
                  type="button" 
                  onClick={handleAddUrl} 
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  + Add URL
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-neutral-400 font-medium shrink-0">Quick presets:</span>
                {[
                  { name: "🏖️ Beach Villa", url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80" },
                  { name: "🏊 Pool Sunset", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" },
                  { name: "🏔️ Mountain Chalet", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" },
                  { name: "🛋️ Luxe Interior", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" }
                ].map(p => (
                  <button 
                    key={p.name} 
                    type="button" 
                    onClick={() => setImages(prev => [...prev, p.url])} 
                    className="px-2.5 py-1 bg-white border border-neutral-200 rounded-full hover:border-black text-[11px] font-medium shrink-0 transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Photo Gallery Grid */}
              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-neutral-200 group bg-neutral-100 shadow-xs">
                      <img 
                        src={img} 
                        alt={`Listing Photo ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      {idx === 0 ? (
                        <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                          ★ Cover Photo
                        </span>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => handleSetPrimary(idx)} 
                          className="absolute bottom-1.5 left-1.5 bg-white/90 hover:bg-white text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          Make Cover
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImage(idx)} 
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition cursor-pointer"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  Please upload at least 1 photo for your listing.
                </p>
              )}
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
