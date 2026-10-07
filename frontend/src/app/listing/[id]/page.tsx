import Header from '@/components/Header';
import ListingBookingSection from '@/components/ListingBookingSection';
import { fetchListing } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const listing = await fetchListing(resolvedParams.id);
  
  if (!listing) {
    notFound();
  }

  const images = listing.images && listing.images.length > 0 
    ? listing.images.map((img: any) => img.image_url) 
    : [listing.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"];

  // Fallback supplementary images if listing has only 1 image
  const displayImages = images.length >= 5 ? images : [
    images[0],
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
  ];

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12 py-8">
        {/* Breadcrumb / Back link */}
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-black">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>Back to explore</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#222222]">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between text-sm text-[#717171] pt-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-semibold text-[#222222]">
                <svg className="w-3.5 h-3.5 fill-[#222222]" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {listing.rating ? listing.rating.toFixed(2) : "4.95"}
              </span>
              <span>·</span>
              <span className="underline cursor-pointer font-medium">{listing.review_count || 120} reviews</span>
              <span>·</span>
              <span className="font-medium">🏆 Superhost</span>
              <span>·</span>
              <span className="underline font-medium text-[#222222]">{listing.location}</span>
            </div>

            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <button className="flex items-center gap-1.5 text-sm font-semibold text-[#222222] hover:bg-neutral-100 px-3 py-1.5 rounded-lg transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                <span>Share</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-[#222222] hover:bg-neutral-100 px-3 py-1.5 rounded-lg transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5-Photo Gallery Grid */}
        <div id="photos" className="grid grid-cols-1 md:grid-cols-4 gap-2.5 h-[340px] sm:h-[420px] md:h-[460px] rounded-2xl overflow-hidden mb-10 scroll-mt-24">
          <div className="md:col-span-2 h-full overflow-hidden">
            <img 
              src={displayImages[0]} 
              alt={listing.title} 
              className="w-full h-full object-cover hover:scale-103 transition duration-300 cursor-pointer"
            />
          </div>
          <div className="hidden md:flex flex-col gap-2.5 h-full overflow-hidden">
            <div className="h-1/2 overflow-hidden">
              <img src={displayImages[1]} alt="Gallery 1" className="w-full h-full object-cover hover:scale-105 transition duration-300 cursor-pointer" />
            </div>
            <div className="h-1/2 overflow-hidden">
              <img src={displayImages[2]} alt="Gallery 2" className="w-full h-full object-cover hover:scale-105 transition duration-300 cursor-pointer" />
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-2.5 h-full overflow-hidden">
            <div className="h-1/2 overflow-hidden">
              <img src={displayImages[3]} alt="Gallery 3" className="w-full h-full object-cover hover:scale-105 transition duration-300 cursor-pointer" />
            </div>
            <div className="h-1/2 overflow-hidden">
              <img src={displayImages[4]} alt="Gallery 4" className="w-full h-full object-cover hover:scale-105 transition duration-300 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Interactive Listing Details, Calendar & Booking Section */}
        <ListingBookingSection listing={listing} />
      </main>
    </div>
  );
}
