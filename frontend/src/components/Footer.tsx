"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [activeModal, setActiveModal] = useState<'language' | 'currency' | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkStored = typeof window !== 'undefined' && (localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark'));
    if (isDarkStored) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModal]);

  const languages = [
    { name: "English", region: "India", selected: true },
    { name: "Azərbaycan dili", region: "Azərbaycan" },
    { name: "Bahasa Indonesia", region: "Indonesia" },
    { name: "Bosanski", region: "Bosna i Hercegovina" },
    { name: "Català", region: "Espanya" },
    { name: "Čeština", region: "Česká republika" },
    { name: "Crnogorski", region: "Crna Gora" },
    { name: "Dansk", region: "Danmark" },
    { name: "Deutsch", region: "Deutschland" },
    { name: "Deutsch", region: "Österreich" },
    { name: "Deutsch", region: "Schweiz" },
    { name: "English", region: "Australia" },
    { name: "English", region: "Canada" },
    { name: "English", region: "Guyana" },
    { name: "English", region: "Ireland" },
    { name: "English", region: "New Zealand" },
    { name: "English", region: "Singapore" },
    { name: "English", region: "United Arab Emirates" }
  ];

  const currencies = [
    { name: "Indian rupee", code: "INR – ₹", selected: true },
    { name: "Australian dollar", code: "AUD – $" },
    { name: "Brazilian real", code: "BRL – R$" },
    { name: "Bulgarian lev", code: "BGN – лв." },
    { name: "Canadian dollar", code: "CAD – $" },
    { name: "Chilean peso", code: "CLP – $" },
    { name: "Chinese yuan", code: "CNY – ¥" },
    { name: "Colombian peso", code: "COP – $" },
    { name: "Costa Rican colon", code: "CRC – ₡" },
    { name: "Czech koruna", code: "CZK – Kč" },
    { name: "Danish krone", code: "DKK – kr" },
    { name: "Egyptian pound", code: "EGP – ج.م" },
    { name: "Emirati dirham", code: "AED – د.إ" },
    { name: "Euro", code: "EUR – €" },
    { name: "Ghanaian cedi", code: "GHS – GH₵" },
    { name: "Hong Kong dollar", code: "HKD – $" },
    { name: "Hungarian forint", code: "HUF – Ft" },
    { name: "Indonesian rupiah", code: "IDR – Rp" },
    { name: "Israeli new shekel", code: "ILS – ₪" },
    { name: "Japanese yen", code: "JPY – ¥" }
  ];

  return (
    <>
      <footer className="bg-[#F7F7F7] border-t border-neutral-200 mt-20">
        <div className="max-w-[1780px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-neutral-200 text-sm">
            <div className="space-y-3">
              <h4 className="font-semibold text-neutral-900">Support</h4>
              <ul className="space-y-2.5 text-neutral-600">
                <li><a href="#" className="hover:underline">Help Centre</a></li>
                <li><a href="#" className="hover:underline">AirCover</a></li>
                <li><a href="#" className="hover:underline">Anti-discrimination</a></li>
                <li><a href="#" className="hover:underline">Disability support</a></li>
                <li><a href="#" className="hover:underline">Cancellation options</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-neutral-900">Hosting</h4>
              <ul className="space-y-2.5 text-neutral-600">
                <li><Link href="/host" className="hover:underline font-medium text-neutral-900">Airbnb your home</Link></li>
                <li><Link href="/host/create" className="hover:underline">Create a listing</Link></li>
                <li><a href="#" className="hover:underline">AirCover for Hosts</a></li>
                <li><a href="#" className="hover:underline">Hosting resources</a></li>
                <li><a href="#" className="hover:underline">Community forum</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-neutral-900">Airbnb</h4>
              <ul className="space-y-2.5 text-neutral-600">
                <li><a href="#" className="hover:underline">Newsroom</a></li>
                <li><a href="#" className="hover:underline">New features</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Investors</a></li>
                <li><a href="#" className="hover:underline">Airbnb.org emergency stays</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-neutral-900">Inspiration</h4>
              <ul className="space-y-2.5 text-neutral-600">
                <li><Link href="/?location=Goa" className="hover:underline">Villas in Goa</Link></li>
                <li><Link href="/?location=Manali" className="hover:underline">Chalets in Manali</Link></li>
                <li><Link href="/?location=Jaipur" className="hover:underline">Havelis in Jaipur</Link></li>
                <li><Link href="/?location=Munnar" className="hover:underline">Treehouses in Munnar</Link></li>
                <li><Link href="/?location=Puri" className="hover:underline">Beach homes in Puri</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
            <div className="flex flex-wrap items-center gap-4">
              <span>© 2026 Airbnb, Inc.</span>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Terms</a>
              <span>·</span>
              <a href="#" className="hover:underline">Sitemap</a>
              <span>·</span>
              <a href="#" className="hover:underline">Company details</a>
            </div>

            <div className="flex items-center gap-5 font-semibold text-neutral-800">
              <button 
                onClick={() => setActiveModal('language')}
                className="flex items-center gap-1.5 hover:underline"
              >
                <span>🌐</span>
                <span>English (IN)</span>
              </button>
              <button 
                onClick={() => setActiveModal('currency')}
                className="hover:underline"
              >
                <span>₹ INR</span>
              </button>
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-300 hover:border-black transition text-xs font-semibold"
                title="Toggle dark mode"
              >
                <span>{isDark ? '☀️ Light' : '🌙 Dark'}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setActiveModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[1032px] max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center px-6 py-4 border-b border-neutral-200">
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 transition text-neutral-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto">
              {activeModal === 'language' && (
                <>
                  <div className="mb-10">
                    <h3 className="text-xl font-semibold text-neutral-800 mb-6">Suggested languages and regions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Few suggested ones */}
                      {[
                        { name: "English", region: "United Kingdom" },
                        { name: "English", region: "United States" },
                        { name: "हिन्दी", region: "भारत" },
                        { name: "मराठी", region: "भारत" }
                      ].map((lang, i) => (
                        <div key={i} className="p-3 rounded-lg hover:bg-neutral-100 cursor-pointer transition">
                          <div className="text-sm text-neutral-800">{lang.name}</div>
                          <div className="text-sm text-neutral-500">{lang.region}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">Choose a language and region</h3>
                    <p className="text-sm text-neutral-600 mb-6">
                      You can manage more language preferences in your <a href="#" className="underline font-semibold">Account settings</a>.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {languages.map((lang, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-lg cursor-pointer transition border ${lang.selected ? 'border-neutral-800 bg-neutral-50' : 'border-transparent hover:bg-neutral-100'}`}
                        >
                          <div className="text-sm text-neutral-800">{lang.name}</div>
                          <div className="text-sm text-neutral-500">{lang.region}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'currency' && (
                <div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-8">Choose a currency</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {currencies.map((curr, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg cursor-pointer transition border ${curr.selected ? 'border-neutral-800 bg-neutral-50' : 'border-transparent hover:bg-neutral-100'}`}
                      >
                        <div className="text-sm text-neutral-800">{curr.name}</div>
                        <div className="text-sm text-neutral-500">{curr.code}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
