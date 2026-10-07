"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WishlistItem {
  id: number | string;
  title: string;
  location: string;
  pricePerNight: number;
  rating?: number;
  imageUrl: string;
  propertyType?: string;
}

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error';
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  isWishlisted: (id: number | string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  toast: ToastMessage | null;
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
  clearToast: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('airbnb_wishlist');
      if (saved) {
        setWishlist(JSON.parse(saved));
      } else {
        // Pre-seed with one favourite for demo
        const initialFav: WishlistItem = {
          id: 1,
          title: "Luxury Beachfront Villa with Private Infinity Pool",
          location: "North Goa, India",
          pricePerNight: 18500,
          rating: 4.98,
          imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
          propertyType: "Mansions"
        };
        setWishlist([initialFav]);
        localStorage.setItem('airbnb_wishlist', JSON.stringify([initialFav]));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const showToast = (title: string, description?: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, title, description, type });
  };

  const clearToast = () => setToast(null);

  // Auto clear toast after 3.5s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const isWishlisted = (id: number | string) => {
    return wishlist.some(item => String(item.id) === String(id));
  };

  const toggleWishlist = (item: WishlistItem) => {
    setWishlist(prev => {
      const exists = prev.some(i => String(i.id) === String(item.id));
      let updated: WishlistItem[];
      if (exists) {
        updated = prev.filter(i => String(i.id) !== String(item.id));
        showToast('Removed from Wishlist', item.title, 'info');
      } else {
        updated = [item, ...prev];
        showToast('Saved to Wishlist ❤️', item.title, 'success');
      }
      try {
        localStorage.setItem('airbnb_wishlist', JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlisted,
        toggleWishlist,
        toast,
        showToast,
        clearToast,
      }}
    >
      {children}
      {/* Floating Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 sm:left-auto sm:right-8 sm:bottom-8 sm:translate-x-0 z-50 flex items-center gap-3 bg-neutral-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-neutral-800 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
            {toast.type === 'success' ? (
              <span className="text-[#FF385C] text-sm">❤️</span>
            ) : (
              <span className="text-white text-sm">ℹ️</span>
            )}
          </div>
          <div className="text-left pr-2">
            <p className="text-sm font-semibold text-white leading-tight">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-neutral-400 truncate max-w-[240px] mt-0.5">{toast.description}</p>
            )}
          </div>
          <button 
            type="button"
            onClick={clearToast}
            className="text-neutral-400 hover:text-white p-1 rounded-full transition text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
