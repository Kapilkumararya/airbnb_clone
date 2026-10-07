import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import ListingCard from '@/components/ListingCard';
import InspirationSection from '@/components/InspirationSection';
import { fetchListings } from '@/lib/api';
import Link from 'next/link';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedSearchParams = await searchParams;
  const listings = await fetchListings(resolvedSearchParams);

  const type = resolvedSearchParams?.type || 'All';
  const searchedLoc = resolvedSearchParams?.location?.trim();

  let topTitle = searchedLoc ? `Stays in ${searchedLoc}` : 'Guest favourite homes';
  let topSubtitle = searchedLoc ? `Explore available vacation rentals in ${searchedLoc}` : 'Indian guests often rate these homes highly';
  let bottomTitle = searchedLoc ? `More popular homes in ${searchedLoc}` : 'Popular destinations across India';
  const showTaxes = resolvedSearchParams?.taxes === '1';
  let badgeLabel = 'Guest favourite';
  let priceLabel = showTaxes ? 'total before taxes' : 'night';
  
  if (type === 'Experiences') {
    topTitle = 'Airbnb Originals';
    topSubtitle = "Hosted by the world's most interesting people";
    bottomTitle = 'Popular with travellers from your area';
    badgeLabel = 'Original';
    priceLabel = 'guest';
  } else if (type === 'Services') {
    topTitle = `Services in North Goa`;
    topSubtitle = '';
    bottomTitle = `Services in Gurgaon District`;
    badgeLabel = '';
    priceLabel = 'guest';
  }

  let topListings = listings ? listings.slice(0, 6) : [];
  let bottomListings = listings ? listings.slice(6) : [];

  if (type === 'Services') {
    topListings = [
      { id: 's1', title: 'Romantic portraits and films by Sherwyn', location: 'North Goa', price_per_night: 4000, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1536640712-4d4c36ef0e4c?auto=format&fit=crop&w=800&q=80' },
      { id: 's2', title: 'Goa Photo Shoot by Samuel', location: 'North Goa', price_per_night: 7500, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80' },
      { id: 's3', title: 'Mobility and movement training by Shane', location: 'North Goa', price_per_night: 1500, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80' },
      { id: 's4', title: 'Paperrose Art Studio Photos for all occasions', location: 'North Goa', price_per_night: 9600, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80' },
      { id: 's5', title: 'Beautiful Makeup by Hazel', location: 'North Goa', price_per_night: 1700, rating: 4.8, image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80' },
      { id: 's6', title: 'Portrait and fashion shoots by Mayur', location: 'North Goa', price_per_night: 4000, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80' }
    ];
    bottomListings = [
      { id: 's7', title: 'Professional Bridal & Makeup Artistry', location: 'Gurgaon', price_per_night: 3600, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1516975080661-46bba0d424b9?auto=format&fit=crop&w=800&q=80' },
      { id: 's8', title: 'Story filled portraits by Rohit', location: 'Gurgaon', price_per_night: 7000, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' },
      { id: 's9', title: 'Breath, Flow & Inner Glow', location: 'Gurgaon', price_per_night: 2500, rating: 4.8, image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80' },
      { id: 's10', title: 'Artful city portraits by Ashish', location: 'Gurgaon', price_per_night: 9500, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80' },
      { id: 's11', title: 'Occasion ready looks by Happy', location: 'Gurgaon', price_per_night: 4000, rating: 4.7, image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80' },
      { id: 's12', title: 'Camera ready glam by Anamika', location: 'Gurgaon', price_per_night: 3500, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1512496015851-a1c8286a1df0?auto=format&fit=crop&w=800&q=80' }
    ];
  } else if (type === 'Experiences') {
    topListings = [
      { id: 'e1', title: 'Carve marble with a third-generation sculptor', location: 'Athens, Greece', price_per_night: 6485, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80' },
      { id: 'e2', title: 'Savor Premium Matcha in tea ceremony in Shibuya', location: 'Shibuya, Japan', price_per_night: 3172, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&w=800&q=80' },
      { id: 'e3', title: "Insider's Food Tour: South Philly & Italian Market", location: 'Philadelphia, United States', price_per_night: 9924, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
      { id: 'e4', title: 'Craft a Georgia peach with a pro glassblower', location: 'Atlanta, United States', price_per_night: 8094, rating: 4.99, image_url: 'https://images.unsplash.com/photo-1531393666013-1b9136122d25?auto=format&fit=crop&w=800&q=80' },
      { id: 'e5', title: 'Sipping Mexico: A Journey Through Mexican Spirits', location: 'Tulum, Mexico', price_per_night: 3891, rating: 4.96, image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80' },
      { id: 'e6', title: 'Prosecco Hills: discover a small producer', location: 'Conegliano, Italy', price_per_night: 3026, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80' }
    ];
  }

  const hasActiveFilters = Boolean(
    resolvedSearchParams?.location ||
    (resolvedSearchParams?.category && resolvedSearchParams.category.toLowerCase() !== 'all') ||
    resolvedSearchParams?.checkIn ||
    resolvedSearchParams?.checkOut ||
    resolvedSearchParams?.guests ||
    resolvedSearchParams?.minPrice ||
    resolvedSearchParams?.maxPrice ||
    resolvedSearchParams?.flexible ||
    (resolvedSearchParams?.type && resolvedSearchParams.type.toLowerCase() !== 'all')
  );

  return (
    <div className="min-h-screen bg-white text-[#222222] flex flex-col font-sans">
      <Header />
      {type !== 'Services' && type !== 'Experiences' && <CategoryNav />}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto px-6 sm:px-10 lg:px-16 py-8">
        {/* Listings Section 1 */}
        {topListings && topListings.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222] flex items-center gap-2 group cursor-pointer">
                  <span>{topTitle}</span>
                  <svg className="w-5 h-5 text-neutral-800 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </h2>
                {topSubtitle && <p className="text-sm text-neutral-500 mt-0.5">{topSubtitle}</p>}
              </div>
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
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10 mb-16">
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
          </>
        ) : (
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
        )}

        {/* Listings Section 2 */}
        {bottomListings && bottomListings.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222] flex items-center gap-2 group cursor-pointer">
                  <span>{bottomTitle}</span>
                  <svg className="w-5 h-5 text-neutral-800 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
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
        {/* Floating Pill: Prices include all fees */}
        <Link 
          href={`/?${new URLSearchParams({ ...(resolvedSearchParams || {}), taxes: showTaxes ? '0' : '1' }).toString()}`}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 shadow-lg bg-white border border-neutral-300 rounded-full px-5 py-2.5 flex items-center gap-2 font-semibold text-sm hover:shadow-xl hover:scale-105 transition duration-200 cursor-pointer select-none"
        >
          <span className="text-[#FF385C]">🏷️</span>
          <span className="text-[#222222]">{showTaxes ? 'Show price per night' : 'Prices include all fees'}</span>
        </Link>

        {/* Functional Inspiration for future getaways */}
        <InspirationSection />
      </main>

      {/* Official Airbnb-Style Footer */}
      <Footer />
    </div>
  );
}