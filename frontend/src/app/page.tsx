import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import InspirationSection from '@/components/InspirationSection';
import HomeExploreView from '@/components/HomeExploreView';
import { fetchListings } from '@/lib/api';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

const ALL_SERVICES = [
  { id: 's1', title: 'Romantic portraits & cinematic films by Sherwyn', location: 'North Goa, India', price_per_night: 4000, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1536640712-4d4c36ef0e4c?auto=format&fit=crop&w=800&q=80', category: 'Photography', guests: 2 },
  { id: 's2', title: 'Goa Golden Hour Beach Photo Shoot by Samuel', location: 'North Goa, India', price_per_night: 7500, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80', category: 'Photography', guests: 4 },
  { id: 's3', title: 'Mobility and sunrise movement training by Shane', location: 'North Goa, India', price_per_night: 1500, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80', category: 'Training', guests: 6 },
  { id: 's4', title: 'Paperrose Art Studio Photos for all occasions', location: 'North Goa, India', price_per_night: 9600, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80', category: 'Photography', guests: 8 },
  { id: 's5', title: 'Coastal Glamour Makeup & Hair by Hazel', location: 'North Goa, India', price_per_night: 1700, rating: 4.8, image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', category: 'Make-up', guests: 2 },
  { id: 's6', title: 'Portrait and tropical fashion shoots by Mayur', location: 'North Goa, India', price_per_night: 4000, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80', category: 'Photography', guests: 4 },
  { id: 's7', title: 'Professional Bridal & Fashion Makeup Artistry', location: 'Gurgaon, India', price_per_night: 3600, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1516975080661-46bba0d424b9?auto=format&fit=crop&w=800&q=80', category: 'Make-up', guests: 2 },
  { id: 's8', title: 'Story filled portraits & urban documentary by Rohit', location: 'Gurgaon, India', price_per_night: 7000, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', category: 'Photography', guests: 4 },
  { id: 's9', title: 'Breath, Vinyasa Flow & Inner Glow Yoga', location: 'Gurgaon, India', price_per_night: 2500, rating: 4.8, image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', category: 'Spa treatments', guests: 6 },
  { id: 's10', title: 'Artful Cyber City portraits by Ashish', location: 'Gurgaon, India', price_per_night: 9500, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80', category: 'Photography', guests: 2 },
  { id: 's11', title: 'Occasion ready glam and styling by Happy', location: 'Gurgaon, India', price_per_night: 4000, rating: 4.7, image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80', category: 'Make-up', guests: 2 },
  { id: 's12', title: 'Celebrity Private Chef Dining Experience', location: 'New Delhi, India', price_per_night: 8500, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', category: 'Chefs', guests: 6 },
  { id: 's13', title: 'Authentic Mughlai Royal Feast by Chef Karim', location: 'New Delhi, India', price_per_night: 6000, rating: 4.95, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', category: 'Chefs', guests: 8 },
  { id: 's14', title: 'Sea Breeze Holistic Massage & Aromatherapy', location: 'Mumbai, India', price_per_night: 4500, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', category: 'Massage', guests: 2 },
  { id: 's15', title: 'Bandra Cinematic Street Photography Session', location: 'Mumbai, India', price_per_night: 5500, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80', category: 'Photography', guests: 3 },
  { id: 's16', title: 'Royal Rajputana Banquet Catering & Private Chef', location: 'Jaipur, India', price_per_night: 7200, rating: 4.95, image_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80', category: 'Catering', guests: 10 },
  { id: 's17', title: 'Ayurvedic Wellness & Herbal Spa Treatment', location: 'Munnar, India', price_per_night: 3500, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80', category: 'Spa treatments', guests: 2 },
  { id: 's18', title: 'High-Energy Mountain Trail Fitness Coach', location: 'Manali, India', price_per_night: 2000, rating: 4.85, image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', category: 'Training', guests: 4 }
];

const ALL_EXPERIENCES = [
  { id: 'e1', title: 'Carve marble with a third-generation sculptor', location: 'Athens, Greece', price_per_night: 6485, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80', guests: 4 },
  { id: 'e2', title: 'Savor Premium Matcha in authentic tea ceremony in Shibuya', location: 'Shibuya, Japan', price_per_night: 3172, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&w=800&q=80', guests: 6 },
  { id: 'e3', title: "Insider's Food Tour: South Philly & Italian Market", location: 'Philadelphia, United States', price_per_night: 9924, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', guests: 8 },
  { id: 'e4', title: 'Craft a Georgia peach with a pro glassblower', location: 'Atlanta, United States', price_per_night: 8094, rating: 4.99, image_url: 'https://images.unsplash.com/photo-1531393666013-1b9136122d25?auto=format&fit=crop&w=800&q=80', guests: 4 },
  { id: 'e5', title: 'Sipping Mexico: A Journey Through Mexican Spirits', location: 'Tulum, Mexico', price_per_night: 3891, rating: 4.96, image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', guests: 8 },
  { id: 'e6', title: 'Prosecco Hills: discover a small family producer', location: 'Conegliano, Italy', price_per_night: 3026, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80', guests: 6 },
  { id: 'e7', title: 'Old Delhi Heritage Food Walk & Secret Spice Markets', location: 'New Delhi, India', price_per_night: 1800, rating: 4.98, image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', guests: 10 },
  { id: 'e8', title: 'Sunset Kayaking in Backwaters & Bioluminescence Tour', location: 'North Goa, India', price_per_night: 2400, rating: 4.95, image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', guests: 6 },
  { id: 'e9', title: 'Dharavi Pottery Workshop & Cultural Experience', location: 'Mumbai, India', price_per_night: 1500, rating: 4.92, image_url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80', guests: 8 },
  { id: 'e10', title: 'Jaipur Blue Pottery Masterclass with Master Craftsman', location: 'Jaipur, India', price_per_night: 2200, rating: 5.0, image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80', guests: 5 },
  { id: 'e11', title: 'Sunrise Rowing Boat Aarti Experience on River Ganga', location: 'Varanasi, India', price_per_night: 1200, rating: 4.97, image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80', guests: 8 },
  { id: 'e12', title: 'Himalayan Pine Forest Trek & Bushcraft Camp', location: 'Manali, India', price_per_night: 3200, rating: 4.96, image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', guests: 6 }
];

export default async function Page({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedSearchParams = await searchParams;
  let listings = await fetchListings(resolvedSearchParams);

  const type = resolvedSearchParams?.type || 'All';
  const searchedLoc = resolvedSearchParams?.location?.trim();

  let topTitle = searchedLoc ? `Stays in ${searchedLoc}` : 'Guest favourite homes';
  let topSubtitle = searchedLoc ? `Explore available vacation rentals in ${searchedLoc}` : 'Indian guests often rate these homes highly';
  let bottomTitle = searchedLoc ? `More popular homes in ${searchedLoc}` : 'Popular destinations across India';
  const showTaxes = resolvedSearchParams?.taxes === '1';
  let badgeLabel = 'Guest favourite';
  let priceLabel = showTaxes ? 'total before taxes' : 'night';

  let currentListings = listings || [];

  if (type === 'Services') {
    let filtered = ALL_SERVICES;
    if (searchedLoc) {
      const q = searchedLoc.toLowerCase();
      filtered = filtered.filter(s => 
        s.location.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
    }
    if (resolvedSearchParams?.guests) {
      const g = Number(resolvedSearchParams.guests);
      if (g > 0) filtered = filtered.filter(s => s.guests >= g);
    }
    if (resolvedSearchParams?.minPrice) {
      filtered = filtered.filter(s => s.price_per_night >= Number(resolvedSearchParams.minPrice));
    }
    if (resolvedSearchParams?.maxPrice) {
      filtered = filtered.filter(s => s.price_per_night <= Number(resolvedSearchParams.maxPrice));
    }

    topTitle = searchedLoc ? `Services in ${searchedLoc}` : 'Featured Host & Guest Services';
    topSubtitle = searchedLoc ? `Top-rated verified professionals in ${searchedLoc}` : 'Book trusted photographers, private chefs, beauty specialists & fitness coaches';
    bottomTitle = searchedLoc ? `More recommended services in ${searchedLoc}` : 'Popular services across destinations';
    badgeLabel = 'Service';
    priceLabel = 'service';
    currentListings = filtered;
  } else if (type === 'Experiences') {
    let filtered = ALL_EXPERIENCES;
    if (searchedLoc) {
      const q = searchedLoc.toLowerCase();
      filtered = filtered.filter(e => 
        e.location.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q)
      );
    }
    if (resolvedSearchParams?.guests) {
      const g = Number(resolvedSearchParams.guests);
      if (g > 0) filtered = filtered.filter(e => e.guests >= g);
    }
    if (resolvedSearchParams?.minPrice) {
      filtered = filtered.filter(e => e.price_per_night >= Number(resolvedSearchParams.minPrice));
    }
    if (resolvedSearchParams?.maxPrice) {
      filtered = filtered.filter(e => e.price_per_night <= Number(resolvedSearchParams.maxPrice));
    }

    topTitle = searchedLoc ? `Experiences in ${searchedLoc}` : 'Airbnb Originals & Experiences';
    topSubtitle = searchedLoc ? `Unforgettable activities hosted by local experts in ${searchedLoc}` : "Hosted by the world's most interesting people";
    bottomTitle = searchedLoc ? `More activities in ${searchedLoc}` : 'Popular with travellers from your area';
    badgeLabel = 'Original';
    priceLabel = 'guest';
    currentListings = filtered;
  } else {
    // Homes or All: Filter by amenities if selected in modal
    if (resolvedSearchParams?.amenities) {
      const reqAmenities = resolvedSearchParams.amenities.split(',').map((a: string) => a.trim().toLowerCase());
      currentListings = currentListings.filter((l: any) => {
        const listAmenities = (l.amenities || []).map((a: string) => (typeof a === 'string' ? a.toLowerCase() : ''));
        return reqAmenities.every((reqA: string) =>
          listAmenities.some((listA: string) => listA.includes(reqA) || reqA.includes(listA))
        );
      });
    }
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
    resolvedSearchParams?.amenities ||
    (resolvedSearchParams?.type && resolvedSearchParams.type.toLowerCase() !== 'all')
  );

  return (
    <div className="min-h-screen bg-white text-[#222222] flex flex-col font-sans">
      <Header />
      {type !== 'Services' && type !== 'Experiences' && <CategoryNav />}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto px-6 sm:px-10 lg:px-16 py-8">
        <HomeExploreView
          listings={currentListings}
          topTitle={topTitle}
          topSubtitle={topSubtitle}
          bottomTitle={bottomTitle}
          showTaxes={showTaxes}
          badgeLabel={badgeLabel}
          priceLabel={priceLabel}
          hasActiveFilters={hasActiveFilters}
          type={type}
          resolvedSearchParams={resolvedSearchParams}
        />

        {/* Functional Inspiration for future getaways */}
        <InspirationSection />
      </main>

      {/* Official Airbnb-Style Footer */}
      <Footer />
    </div>
  );
}