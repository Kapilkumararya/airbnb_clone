export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('airbnb_token');
  }
  return null;
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
    
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch listings');
    return await res.json();
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

export async function fetchListing(id: string | number) {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch listing');
    return await res.json();
  } catch (error) {
    console.error(`Error fetching listing #${id}:`, error);
    return null;
  }
}

export async function fetchListingBookedDates(id: string | number): Promise<{ check_in: string; check_out: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/listing/${id}/booked-dates`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error(`Error fetching booked dates for listing #${id}:`, error);
    return [];
  }
}

export async function fetchMyBookings(token?: string) {
  const authToken = token || getAuthToken();
  if (!authToken) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${authToken}` },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch user bookings');
    return await res.json();
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    return [];
  }
}

export async function fetchHostBookings(token?: string) {
  const authToken = token || getAuthToken();
  if (!authToken) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/host`, {
      headers: { Authorization: `Bearer ${authToken}` },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching host bookings:', error);
    return [];
  }
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

  const res = await fetch(`${API_BASE_URL}/bookings/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Reservation failed.');
  return resData;
}

export async function cancelBooking(bookingId: number, token?: string) {
  const authToken = token || getAuthToken();
  const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Failed to cancel reservation');
  return resData;
}

export async function fetchHostListings(token?: string) {
  const authToken = token || getAuthToken();
  if (!authToken) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/listings/host/my`, {
      headers: { Authorization: `Bearer ${authToken}` },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching host listings:', error);
    return [];
  }
}

export async function createListing(data: any, token?: string) {
  const authToken = token || getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}/listings/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Failed to create listing');
  return resData;
}

export async function updateListing(id: number, data: any, token?: string) {
  const authToken = token || getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Failed to update listing');
  return resData;
}

export async function deleteListing(id: number, token?: string) {
  const authToken = token || getAuthToken();
  const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
    method: 'DELETE',
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Failed to delete listing');
  return resData;
}

export async function addReview(listingId: number, data: { rating: number; comment: string }, token?: string) {
  const authToken = token || getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}/listings/${listingId}/reviews`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Failed to submit review');
  return resData;
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
    if (!res.ok) {
      return { can_review: false, reason: "Unable to verify review eligibility." };
    }
    return await res.json();
  } catch {
    return { can_review: false, reason: "Unable to verify stay." };
  }
}
