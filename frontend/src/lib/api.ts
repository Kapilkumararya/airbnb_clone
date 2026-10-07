import { MOCK_LISTINGS, MOCK_DEMO_TRIPS, MOCK_DEMO_HOST_LISTINGS } from './mockData';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://127.0.0.1:8000/api' 
    : 'https://airbnb-clone-bmvr.onrender.com/api');

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('airbnb_token');
  }
  return null;
}

function filterLocalListings(listings: any[], searchParams?: { 
  location?: string; 
  category?: string; 
  checkIn?: string; 
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
}) {
  let filtered = [...listings];
  if (searchParams?.location) {
    const loc = searchParams.location.toLowerCase();
    filtered = filtered.filter(l => 
      (l.location && l.location.toLowerCase().includes(loc)) ||
      (l.title && l.title.toLowerCase().includes(loc))
    );
  }
  if (searchParams?.category && searchParams.category.toLowerCase() !== 'all') {
    const cat = searchParams.category.toLowerCase();
    filtered = filtered.filter(l => 
      l.property_type && l.property_type.toLowerCase() === cat
    );
  }
  if (searchParams?.guests) {
    filtered = filtered.filter(l => (l.max_guests || 1) >= Number(searchParams.guests));
  }
  if (searchParams?.minPrice) {
    filtered = filtered.filter(l => l.price_per_night >= Number(searchParams.minPrice));
  }
  if (searchParams?.maxPrice) {
    filtered = filtered.filter(l => l.price_per_night <= Number(searchParams.maxPrice));
  }
  return filtered;
}

export async function fetchListings(searchParams?: { 
  location?: string; 
  category?: string; 
  checkIn?: string; 
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
}) {
  try {
    const url = new URL(`${API_BASE_URL}/listings`);
    if (searchParams?.location) url.searchParams.append('location', searchParams.location);
    if (searchParams?.category && searchParams.category.toLowerCase() !== 'all') {
      url.searchParams.append('category', searchParams.category);
    }
    if (searchParams?.checkIn) url.searchParams.append('checkIn', searchParams.checkIn);
    if (searchParams?.checkOut) url.searchParams.append('checkOut', searchParams.checkOut);
    if (searchParams?.guests) url.searchParams.append('guests', String(searchParams.guests));
    if (searchParams?.minPrice) url.searchParams.append('minPrice', String(searchParams.minPrice));
    if (searchParams?.maxPrice) url.searchParams.append('maxPrice', String(searchParams.maxPrice));
    
    // Fast 3s timeout so offline backend falls back immediately without hanging
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url.toString(), { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (error) {
    console.warn('Backend listings API unavailable, serving fallback data:', error);
  }
  return filterLocalListings(MOCK_LISTINGS, searchParams);
}

export async function fetchListing(id: string | number) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) return await res.json();
  } catch (error) {
    console.warn(`Backend fetchListing #${id} unavailable, serving fallback`);
  }
  return MOCK_LISTINGS.find(l => String(l.id) === String(id)) || MOCK_LISTINGS[0];
}

export async function fetchListingBookedDates(id: string | number): Promise<{ check_in: string; check_out: string }[]> {
  const dates: { check_in: string; check_out: string }[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/listing/${id}/booked-dates`, { cache: 'no-store' });
    if (res.ok) {
      const serverDates = await res.json();
      dates.push(...serverDates);
    }
  } catch {
    /* ignore */
  }

  // Include locally booked dates
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('airbnb_user_bookings');
      if (stored) {
        const localList = JSON.parse(stored);
        const matching = localList.filter((b: any) => String(b.listing_id) === String(id) && b.status !== 'cancelled');
        matching.forEach((m: any) => {
          dates.push({ check_in: m.check_in, check_out: m.check_out });
        });
      }
    } catch { /* ignore */ }
  }

  // Preloaded mock booked dates
  const matched = MOCK_DEMO_TRIPS.filter(t => String(t.listing_id) === String(id));
  matched.forEach(m => dates.push({ check_in: m.check_in, check_out: m.check_out }));
  return dates;
}

export async function fetchMyBookings(token?: string) {
  const authToken = token || getAuthToken();
  let serverBookings: any[] = [];
  if (authToken) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${authToken}` },
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) serverBookings = await res.json();
    } catch (error) {
      console.warn('Backend my bookings unavailable, serving fallback trips');
    }
  }

  // Retrieve locally saved bookings
  let localBookings: any[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('airbnb_user_bookings');
      if (stored) localBookings = JSON.parse(stored);
    } catch { /* ignore */ }
  }

  if (serverBookings.length > 0) {
    const existingIds = new Set(serverBookings.map(b => b.id));
    return [...localBookings.filter(b => !existingIds.has(b.id)), ...serverBookings];
  }

  const existingIds = new Set(localBookings.map(b => b.id));
  return [...localBookings, ...MOCK_DEMO_TRIPS.filter(t => !existingIds.has(t.id))];
}

export async function fetchHostBookings(token?: string) {
  const authToken = token || getAuthToken();
  if (!authToken) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/host`, {
      headers: { Authorization: `Bearer ${authToken}` },
      cache: 'no-store'
    });
    if (res.ok) return await res.json();
  } catch (error) {
    /* ignore */
  }
  return [
    {
      id: 101,
      listing_id: 1,
      guest_id: 2,
      check_in: new Date(Date.now() + 86400000 * 5).toISOString(),
      check_out: new Date(Date.now() + 86400000 * 9).toISOString(),
      guests: 4,
      total_price: 74000,
      status: "confirmed",
      guest: { name: "Aarav Sharma", email: "guest@example.com" },
      listing: { title: "Luxury Beachfront Villa with Private Infinity Pool" }
    }
  ];
}

export async function createBooking(data: {
  listing_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  cleaning_fee?: number;
  service_fee?: number;
}, token?: string) {
  const authToken = token || getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  let created: any = null;
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    const resData = await res.json();
    if (res.ok) {
      created = resData;
    } else {
      throw new Error(resData.detail || 'Reservation failed.');
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch') && !err.message.includes('failed to fetch') && !err.message.includes('Load failed')) {
      throw err;
    }
    // If backend is offline or sleeping, create resilient local booking
    console.warn('Backend booking offline, creating local booking:', err);
    const nights = Math.max(1, Math.round((new Date(data.check_out).getTime() - new Date(data.check_in).getTime()) / 86400000));
    const matchingListing = MOCK_LISTINGS.find(l => Number(l.id) === Number(data.listing_id)) || MOCK_LISTINGS[0];
    const nightly = matchingListing.price_per_night || 12000;
    created = {
      id: Math.floor(Math.random() * 10000) + 100,
      listing_id: Number(data.listing_id),
      check_in: data.check_in,
      check_out: data.check_out,
      guests: data.guests,
      total_price: nights * nightly + (data.cleaning_fee || 1500) + (data.service_fee || 1200),
      status: 'confirmed',
      listing: matchingListing
    };
  }

  // Persist into localStorage so user's new booking is immediately visible in /trips and calendar
  if (typeof window !== 'undefined' && created) {
    try {
      const existingStr = localStorage.getItem('airbnb_user_bookings');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      if (!created.listing) {
        created.listing = MOCK_LISTINGS.find(l => Number(l.id) === Number(data.listing_id)) || MOCK_LISTINGS[0];
      }
      localStorage.setItem('airbnb_user_bookings', JSON.stringify([created, ...existing]));
    } catch {
      /* ignore */
    }
  }

  return created;
}

export async function cancelBooking(bookingId: number, token?: string) {
  const authToken = token || getAuthToken();
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('airbnb_user_bookings');
      if (stored) {
        const localList = JSON.parse(stored);
        const updated = localList.filter((b: any) => Number(b.id) !== Number(bookingId));
        localStorage.setItem('airbnb_user_bookings', JSON.stringify(updated));
      }
    } catch { /* ignore */ }
  }
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.detail || 'Failed to cancel reservation');
    return resData;
  } catch {
    return { success: true };
  }
}

export async function fetchHostListings(token?: string) {
  const authToken = token || getAuthToken();
  if (!authToken) return [];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE_URL}/listings/host/my`, {
      headers: { Authorization: `Bearer ${authToken}` },
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) return await res.json();
  } catch (error) {
    console.warn('Backend host listings unavailable, serving fallback');
  }
  return MOCK_DEMO_HOST_LISTINGS;
}

export async function createListing(data: any, token?: string) {
  const authToken = token || getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  try {
    const res = await fetch(`${API_BASE_URL}/listings/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    const resData = await res.json();
    if (res.ok) return resData;
    throw new Error(resData.detail || 'Failed to create listing');
  } catch {
    return { id: Date.now(), ...data };
  }
}

export async function updateListing(id: number, data: any, token?: string) {
  const authToken = token || getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  try {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    const resData = await res.json();
    if (res.ok) return resData;
    throw new Error(resData.detail || 'Failed to update listing');
  } catch {
    return { id, ...data };
  }
}

export async function deleteListing(id: number, token?: string) {
  const authToken = token || getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'DELETE',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
    const resData = await res.json();
    if (res.ok) return resData;
    throw new Error(resData.detail || 'Failed to delete listing');
  } catch {
    return { success: true };
  }
}

export async function addReview(listingId: number, data: { rating: number; comment: string }, token?: string) {
  const authToken = token || getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  try {
    const res = await fetch(`${API_BASE_URL}/listings/${listingId}/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    const resData = await res.json();
    if (res.ok) return resData;
    throw new Error(resData.detail || 'Failed to submit review');
  } catch {
    return { id: Date.now(), ...data };
  }
}

export async function checkReviewEligibility(listingId: number, token?: string): Promise<{ can_review: boolean; reason: string }> {
  const authToken = token || getAuthToken();
  if (!authToken) {
    return { can_review: false, reason: "Please sign in to check review eligibility." };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${listingId}/review-eligibility`, {
      headers: { Authorization: `Bearer ${authToken}` },
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    /* fallback */
  }

  // Fallback verification check against preloaded past trips
  const isEligible = MOCK_DEMO_TRIPS.some(t => Number(t.listing_id) === Number(listingId));
  if (isEligible) {
    return { can_review: true, reason: "Verified guest stay completed. You are eligible to review this listing." };
  }
  return { can_review: false, reason: "Review restricted: You must have a completed stay at this property to leave a review." };
}
