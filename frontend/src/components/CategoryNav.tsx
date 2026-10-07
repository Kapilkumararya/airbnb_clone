"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const categories = [
  { name: "All", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /> },
  { name: "Amazing views", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /> },
  { name: "Beachfront", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /> },
  { name: "Cabins", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-4.5 4.5 4.5" /> },
  { name: "Mansions", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5" /> },
  { name: "Trending", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /> },
  { name: "OMG!", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /> },
  { name: "Islands", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" /> },
  { name: "Luxe", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /> }
];

export default function CategoryNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  
  // Scroll behavior: hide when scrolling down / away from top
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [filterGuests, setFilterGuests] = useState(searchParams.get('guests') || '');
  const [modalCategory, setModalCategory] = useState(searchParams.get('category') || '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get('amenities') ? searchParams.get('amenities')!.split(',').filter(Boolean) : []
  );
  
  // Tax toggle state
  const [showTaxes, setShowTaxes] = useState(searchParams.get('taxes') === '1');

  // Slider scroll ref
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (dir: 'left' | 'right') => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category: string) => {
    if (category.toLowerCase() === 'all') {
      router.push('/');
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('category')?.toLowerCase() === category.toLowerCase()) {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleToggleTaxes = () => {
    const next = !showTaxes;
    setShowTaxes(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set('taxes', '1');
    } else {
      params.delete('taxes');
    }
    router.push(`/?${params.toString()}`);
  };

  // Open modal and sync with current searchParams
  const handleOpenModal = () => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setFilterGuests(searchParams.get('guests') || '');
    setModalCategory(searchParams.get('category') || '');
    setSelectedAmenities(
      searchParams.get('amenities') ? searchParams.get('amenities')!.split(',').filter(Boolean) : []
    );
    setIsModalOpen(true);
  };

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev => 
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice.trim()) params.set('minPrice', minPrice.trim());
    else params.delete('minPrice');

    if (maxPrice.trim()) params.set('maxPrice', maxPrice.trim());
    else params.delete('maxPrice');

    if (filterGuests.trim()) params.set('guests', filterGuests.trim());
    else params.delete('guests');

    if (modalCategory.trim()) params.set('category', modalCategory.trim());
    else params.delete('category');

    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
    else params.delete('amenities');

    setIsModalOpen(false);
    router.push(`/?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setFilterGuests('');
    setModalCategory('');
    setSelectedAmenities([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('guests');
    params.delete('category');
    params.delete('amenities');
    setIsModalOpen(false);
    router.push(`/?${params.toString()}`);
  };

  // Count active filters for badge
  const activeFiltersCount = [
    searchParams.get('category'),
    searchParams.get('minPrice'),
    searchParams.get('maxPrice'),
    searchParams.get('guests'),
    searchParams.get('amenities'),
  ].filter(Boolean).length;

  return (
    <>
      <section 
        aria-label="Explore Airbnb categories" 
        className={`bg-white border-b border-neutral-200 transition-all duration-300 relative z-20 ${
          isScrolled 
            ? 'max-h-0 opacity-0 -translate-y-4 pointer-events-none py-0 overflow-hidden border-transparent' 
            : 'max-h-28 opacity-100 translate-y-0 py-3'
        }`}
      >
        <div className="max-w-[1780px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center gap-4">
          
          {/* Left Arrow Button */}
          <button 
            onClick={() => scrollSlider('left')}
            className="hidden md:flex w-8 h-8 rounded-full border border-neutral-300 items-center justify-center text-neutral-600 hover:border-black hover:scale-105 transition shrink-0 shadow-xs"
            aria-label="Previous categories"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Category Item Slider */}
          <div 
            ref={sliderRef}
            className="flex-1 flex items-center gap-7 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth" 
            id="categorySlider"
          >
            {categories.map((c) => {
              const isActive = c.name === 'All' 
                ? (!activeCategory || activeCategory.toLowerCase() === 'all') 
                : activeCategory?.toLowerCase() === c.name.toLowerCase();
              return (
                <button 
                  key={c.name}
                  onClick={() => handleCategoryClick(c.name)}
                  className={`flex flex-col items-center gap-2 pb-2 text-xs whitespace-nowrap min-w-fit transition relative group cursor-pointer ${
                    isActive 
                      ? 'text-neutral-900 font-bold border-b-2 border-neutral-900' 
                      : 'text-neutral-500 hover:text-neutral-900 font-medium border-b-2 border-transparent hover:border-neutral-300'
                  }`}
                >
                  <svg 
                    className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                      isActive ? 'stroke-neutral-900 stroke-[2.25]' : 'stroke-neutral-500 group-hover:stroke-neutral-900'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.75" 
                    viewBox="0 0 24 24"
                  >
                    {c.icon}
                  </svg>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button 
            onClick={() => scrollSlider('right')}
            className="hidden md:flex w-8 h-8 rounded-full border border-neutral-300 items-center justify-center text-neutral-600 hover:border-black hover:scale-105 transition shrink-0 shadow-xs"
            aria-label="Next categories"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Right Controls: Filter Pill & Total Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Filters Button */}
            <button 
              onClick={handleOpenModal}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs ${
                activeFiltersCount > 0 
                  ? 'border-neutral-900 bg-neutral-900 text-white' 
                  : 'border-neutral-300 text-neutral-700 hover:border-neutral-900 bg-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Display total before taxes toggle */}
            <div 
              onClick={handleToggleTaxes}
              className="hidden xl:flex items-center gap-3 px-4 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 cursor-pointer select-none hover:border-neutral-800 transition bg-white shadow-xs"
            >
              <span>Display total before taxes</span>
              <div 
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  showTaxes ? 'bg-neutral-900' : 'bg-neutral-200'
                }`}
              >
                <div 
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition duration-200 ease-in-out ${
                    showTaxes ? 'translate-x-4' : 'translate-x-0'
                  }`} 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Airbnb Filters Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold transition"
              >
                ✕
              </button>
              <h3 className="text-base font-bold text-neutral-900">Filters</h3>
              <div className="w-8" />
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
              {/* Price Range */}
              <div className="space-y-3 pb-6 border-b border-neutral-200">
                <h4 className="text-base font-bold text-neutral-900">Price range</h4>
                <p className="text-xs text-neutral-500">Nightly prices before taxes and fees</p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 border border-neutral-300 rounded-xl focus-within:border-black transition">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500">Minimum (₹)</label>
                    <input 
                      type="number"
                      placeholder="500"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-sm font-semibold focus:outline-none focus:ring-0 text-neutral-900"
                    />
                  </div>
                  <div className="p-3 border border-neutral-300 rounded-xl focus-within:border-black transition">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500">Maximum (₹)</label>
                    <input 
                      type="number"
                      placeholder="35000"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-sm font-semibold focus:outline-none focus:ring-0 text-neutral-900"
                    />
                  </div>
                </div>
              </div>

              {/* Property Type / Category */}
              <div className="space-y-3 pb-6 border-b border-neutral-200">
                <h4 className="text-base font-bold text-neutral-900">Property Category</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {categories.map(c => {
                    const isSelected = modalCategory.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setModalCategory(isSelected ? '' : c.name)}
                        className={`px-4 py-2 rounded-full border text-xs font-semibold transition ${
                          isSelected 
                            ? 'bg-neutral-900 text-white border-black' 
                            : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guests Count */}
              <div className="space-y-3 pb-6 border-b border-neutral-200">
                <h4 className="text-base font-bold text-neutral-900">Guests</h4>
                <div className="flex gap-2 flex-wrap pt-1">
                  {['Any', '1', '2', '4', '6', '8+'].map(g => {
                    const val = g === 'Any' ? '' : g.replace('+', '');
                    const isSelected = filterGuests === val;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFilterGuests(val)}
                        className={`px-5 py-2.5 rounded-full border text-xs font-semibold transition ${
                          isSelected 
                            ? 'bg-neutral-900 text-white border-black' 
                            : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3 pb-6">
                <h4 className="text-base font-bold text-neutral-900">Amenities</h4>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {[
                    { name: 'Wifi', icon: '📶' },
                    { name: 'Pool', icon: '🏊‍♂️' },
                    { name: 'Kitchen', icon: '🍳' },
                    { name: 'Air conditioning', icon: '❄️' },
                    { name: 'Free parking', icon: '🚗' },
                    { name: 'Dedicated workspace', icon: '💼' },
                    { name: 'Hot tub', icon: '🛁' },
                    { name: 'Washer', icon: '🧺' },
                    { name: 'Pet friendly', icon: '🐾' },
                    { name: 'Beachfront', icon: '🏖️' },
                  ].map(amenity => {
                    const isSelected = selectedAmenities.includes(amenity.name);
                    return (
                      <button
                        key={amenity.name}
                        type="button"
                        onClick={() => toggleAmenity(amenity.name)}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold transition text-left ${
                          isSelected
                            ? 'border-black bg-neutral-900 text-white shadow-xs'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:border-black'
                        }`}
                      >
                        <span className="text-base">{amenity.icon}</span>
                        <span>{amenity.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 flex items-center justify-between bg-white">
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold underline text-neutral-700 hover:text-black transition"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-6 py-3 bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Show places
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
