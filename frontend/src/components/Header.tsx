"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, isDemoUser } = useAuth();
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [activeDropdown, setActiveDropdown] = useState<'where' | 'when' | 'who' | null>(null);
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0, pets: 0 });
  const [selectedService, setSelectedService] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [dateTab, setDateTab] = useState<'Dates' | 'Flexible'>('Dates');
  const [flexibility, setFlexibility] = useState('Exact dates');
  const [flexibleDuration, setFlexibleDuration] = useState<'Weekend' | 'Week' | 'Month'>('Weekend');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [destinationCategory, setDestinationCategory] = useState('All');

  const allMonths = Array.from({ length: 24 }).map((_, i) => {
    const d = new Date(2026, 9 + i, 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      name: d.toLocaleString('en-US', { month: 'long' }),
      shortName: d.toLocaleString('en-US', { month: 'short' }),
      year: d.getFullYear(),
    };
  });

  const visibleMonths = allMonths.slice(monthOffset, monthOffset + 6);

  const toggleMonth = (key: string) => {
    setSelectedMonths(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const getWhenDisplayText = () => {
    if (dateTab === 'Flexible') {
      if (selectedMonths.length === 0) {
        return 'Anytime';
      }
      const monthNames = selectedMonths.map(k => {
        const [y, m] = k.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1, 1);
        return d.toLocaleString('en-US', { month: 'short' });
      });
      const prefix = flexibleDuration === 'Weekend' ? 'A weekend' : flexibleDuration === 'Week' ? 'A week' : 'A month';
      return `${prefix} in ${monthNames.join(', ')}`;
    }

    if (checkIn) {
      return `${checkIn.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}${checkOut ? ` - ${checkOut.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}` : ''}`;
    }

    return 'Anytime';
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return d.getTime() < today.getTime();
  };

  const handleDateClick = (date: Date) => {
    if (isPast(date)) return;
    const clickedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clickedDate);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (clickedDate.getTime() > checkIn.getTime()) {
        setCheckOut(clickedDate);
      } else {
        setCheckIn(clickedDate);
        setCheckOut(null);
      }
    }
  };

  const isSelected = (date: Date) => {
    const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    if (checkIn && dTime === new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate()).getTime()) return true;
    if (checkOut && dTime === new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate()).getTime()) return true;
    return false;
  };
  
  const isInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const ciTime = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate()).getTime();
    const coTime = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate()).getTime();
    return dTime > ciTime && dTime < coTime;
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
        setActiveDropdown(null);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
    };
    
    const el = dropdownRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (el) {
        el.removeEventListener('wheel', handleWheel);
      }
    };
  }, [activeDropdown]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (location.trim()) {
      params.set('location', location.trim());
    } else {
      params.delete('location');
    }

    if (dateTab === 'Flexible') {
      if (selectedMonths.length > 0) {
        params.set('flexible', flexibleDuration.toLowerCase());
        params.set('months', selectedMonths.join(','));
        const firstMonthKey = selectedMonths[0];
        const [y, m] = firstMonthKey.split('-');
        const year = parseInt(y);
        const month = parseInt(m) - 1;

        let start: Date;
        let end: Date;

        if (flexibleDuration === 'Weekend') {
          start = new Date(year, month, 1);
          while (start.getDay() !== 5 && start.getDay() !== 6) {
            start.setDate(start.getDate() + 1);
          }
          end = new Date(start);
          end.setDate(end.getDate() + 2);
        } else if (flexibleDuration === 'Week') {
          start = new Date(year, month, 1);
          end = new Date(year, month, 8);
        } else {
          start = new Date(year, month, 1);
          end = new Date(year, month + 1, 0);
        }

        const ci = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
        const co = new Date(end.getTime() - end.getTimezoneOffset() * 60000);
        params.set('checkIn', ci.toISOString().split('T')[0]);
        params.set('checkOut', co.toISOString().split('T')[0]);
      } else {
        params.delete('flexible');
        params.delete('months');
        params.delete('checkIn');
        params.delete('checkOut');
      }
    } else {
      params.delete('flexible');
      params.delete('months');
      if (checkIn) {
        const ci = new Date(checkIn.getTime() - checkIn.getTimezoneOffset() * 60000);
        params.set('checkIn', ci.toISOString().split('T')[0]);
      } else {
        params.delete('checkIn');
      }
      if (checkOut) {
        const co = new Date(checkOut.getTime() - checkOut.getTimezoneOffset() * 60000);
        params.set('checkOut', co.toISOString().split('T')[0]);
      } else {
        params.delete('checkOut');
      }
    }

    if (totalGuests > 0) {
      params.set('guests', String(totalGuests));
    } else {
      params.delete('guests');
    }
    router.push(`/?${params.toString()}`);
  };

  useEffect(() => {
    const locParam = searchParams.get('location') || '';
    const typeParam = searchParams.get('type') || 'All';
    setLocation(locParam);
    setActiveTab(typeParam);

    if (!searchParams.get('location') && !searchParams.get('checkIn') && !searchParams.get('checkOut') && !searchParams.get('flexible')) {
      setCheckIn(null);
      setCheckOut(null);
      setSelectedMonths([]);
      setGuests({ adults: 0, children: 0, infants: 0, pets: 0 });
    }
  }, [searchParams]);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === 'All') {
      setLocation('');
      setCheckIn(null);
      setCheckOut(null);
      setGuests({ adults: 0, children: 0, infants: 0, pets: 0 });
      setSelectedMonths([]);
      setDateTab('Dates');
      setActiveDropdown(null);
      router.push('/');
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', tabName);
    router.push(`/?${params.toString()}`);
  };

  const navTabs = [
    { name: "All", icon: "🌍" },
    { name: "Homes", icon: "🏡" },
    { name: "Experiences", icon: "🎈" },
    { name: "Services", icon: "🛎️" },
  ];

  const suggestedDestinations = [
    { name: "Nearby", query: "Nearby", desc: "Explore stays around you", icon: "🧭", category: "All", tag: "Flexible" },
    { name: "New Delhi, Delhi", query: "New Delhi", desc: "Monuments, heritage & urban culture", icon: "🏙️", category: "Cities", tag: "4 stays" },
    { name: "Mumbai, Maharashtra", query: "Mumbai", desc: "Marine Drive, Bandra & ocean sunsets", icon: "🌆", category: "Cities", tag: "4 stays" },
    { name: "North Goa, Goa", query: "North Goa", desc: "Sunny beaches, cafes & private pool villas", icon: "🏝️", category: "Beaches", tag: "3 stays" },
    { name: "Varanasi, Uttar Pradesh", query: "Varanasi", desc: "Sacred ghats, Ganga aarti & temples", icon: "🏛️", category: "Heritage", tag: "3 stays" },
    { name: "Bhopal, Madhya Pradesh", query: "Bhopal", desc: "City of scenic lakes & royal heritage", icon: "🏖️", category: "Nature", tag: "3 stays" },
    { name: "Jaipur, Rajasthan", query: "Jaipur", desc: "Pink City havelis, palaces & forts", icon: "🏰", category: "Heritage", tag: "2 stays" },
    { name: "Manali, Himachal Pradesh", query: "Manali", desc: "Snowcapped Himalayan peaks & cedar chalets", icon: "🏔️", category: "Nature", tag: "2 stays" },
    { name: "Udaipur, Rajasthan", query: "Udaipur", desc: "Romantic lakes & majestic palace suites", icon: "⛵", category: "Heritage", tag: "2 stays" },
    { name: "Munnar, Kerala", query: "Munnar", desc: "Mist-covered tea estates & waterfalls", icon: "🌿", category: "Nature", tag: "2 stays" },
    { name: "Bengaluru, Karnataka", query: "Bengaluru", desc: "Garden city, specialty cafes & tech hubs", icon: "🌳", category: "Cities", tag: "2 stays" },
    { name: "Alibaug, Maharashtra", query: "Alibaug", desc: "Coastal getaway with private designer villas", icon: "🌊", category: "Beaches", tag: "1 stay" }
  ];

  const totalGuests = guests.adults + guests.children;

  return (
    <>
      <div className="h-[180px] sm:h-[170px] w-full shrink-0" />
      
      {activeDropdown && (
        <div className="fixed inset-0 bg-black/10 z-30" onClick={() => setActiveDropdown(null)} />
      )}

      <header className="fixed top-0 left-0 w-full z-40 bg-white border-b border-neutral-200 transition-all duration-300">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-10 lg:px-16 pt-2 sm:pt-3">
          {/* Top Navbar Row */}
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link 
              href="/" 
              aria-label="Airbnb homepage" 
              onClick={() => {
                setActiveTab('All');
                setLocation('');
                setCheckIn(null);
                setCheckOut(null);
                setGuests({ adults: 0, children: 0, infants: 0, pets: 0 });
                setSelectedMonths([]);
                setDateTab('Dates');
                setActiveDropdown(null);
              }}
              className="flex items-center gap-2 focus:outline-none group shrink-0"
            >
              <svg className="h-8 w-8 text-[#FF385C] shrink-0 transition-transform duration-200 group-hover:scale-105" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.953l.558 1.089.08.159c2.041 4.004 3.821 7.608 5.279 10.794l.026.025.533 1.22.318.764c.243.613.294 1.222.213 1.858zm1.22-2.39c-.186-.583-.505-1.271-.9-2.094v-.03c-1.889-4.006-3.642-7.608-5.307-10.844l-.111-.163C15.317 1.461 14.468 0 12.001 0c-2.44 0-3.476 1.695-4.535 3.898l-.081.16c-1.669 3.236-3.421 6.843-5.303 10.847v.053l-.559 1.22c-.21.504-.317.768-.345.847C-.172 20.74 2.611 24 5.98 24c.027 0 .132 0 .265-.027h.372c1.75-.213 3.554-1.325 5.384-3.317 1.829 1.989 3.635 3.104 5.382 3.317h.372c.133.027.239.027.265.027 3.37.003 6.152-3.261 4.802-6.975z" />
              </svg>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#FF385C] hidden sm:inline">airbnb</span>
            </Link>

            {/* Desktop Center Tabs / Compact Scrolled Search */}
            <div className="hidden sm:flex flex-1 justify-center transition-all duration-300">
              {isScrolled ? (
                <button onClick={() => { window.scrollTo({top: 0, behavior: 'smooth'}); }} className="flex items-center border border-neutral-300 rounded-full py-2 px-2 pl-4 shadow-sm hover:shadow-md transition bg-white animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="flex items-center gap-2 text-sm font-medium px-4 border-r border-neutral-300">
                    <span className="text-lg">{activeTab === 'Services' ? '🛎️' : '🛖'}</span>
                    Anywhere
                  </span>
                  <span className="text-sm font-medium px-4 border-r border-neutral-300">Anytime</span>
                  <span className="text-sm text-neutral-500 px-4">{activeTab === 'Services' ? 'Add service' : 'Add guests'}</span>
                  <div className="bg-[#FF385C] p-2 rounded-full text-white ml-2">
                    <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              ) : (
                <nav aria-label="Experience types" className="flex items-center gap-4 sm:gap-8 animate-in fade-in duration-300">
                  {navTabs.map(tab => {
                    const isSelected = activeTab === tab.name;
                    return (
                      <button 
                        key={tab.name}
                        onClick={() => handleTabClick(tab.name)}
                        className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-all relative ${
                          isSelected 
                            ? 'text-neutral-900 font-bold' 
                            : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50 px-2 rounded-lg'
                        }`}
                      >
                        <span className="text-xl hidden sm:inline">{tab.icon}</span>
                        <span>{tab.name}</span>
                        {isSelected && (
                          <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-neutral-900 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right Nav Actions */}
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
              <Link 
                href="/host" 
                className="text-sm font-semibold text-neutral-800 hover:bg-neutral-100 px-3.5 py-2 rounded-full transition hidden lg:inline-block"
              >
                Become a host
              </Link>

              {/* Dummy account indicator badge */}
              {isDemoUser && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 rounded-full text-xs font-semibold text-amber-900 shadow-xs" title="Logged in as Demo Invigilator for evaluation">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Dummy Account</span>
                </div>
              )}

              {/* User avatar or login link */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-[#FF385C] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="w-10 h-10 border border-neutral-300 rounded-full flex items-center justify-center hover:shadow-md transition text-neutral-700 bg-white shrink-0"
                  title="Log in or sign up"
                >
                  <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </Link>
              )}

              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-10 h-10 border border-neutral-300 rounded-full flex items-center justify-center hover:shadow-md transition text-neutral-700 bg-white shrink-0"
                  title="Menu"
                >
                  <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {user ? (
                      <>
                        {isDemoUser ? (
                          <div className="px-4 py-3 border-b border-amber-200 bg-amber-50/80 rounded-t-2xl">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                              <span>🧪 Demo Account</span>
                            </div>
                            <p className="text-sm font-bold text-neutral-900 truncate">{user.name}</p>
                            <p className="text-xs text-neutral-600 truncate">{user.email}</p>
                            <p className="text-[11px] text-amber-800 mt-1 leading-snug">
                              Preloaded with 3 past trips &amp; 3 hosted listings for testing.
                            </p>
                          </div>
                        ) : (
                          <div className="px-4 py-3 border-b border-neutral-100">
                            <p className="text-sm font-bold text-neutral-900 truncate">{user.name}</p>
                            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                          </div>
                        )}
                        <Link href="/trips" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition">My Trips &amp; Bookings</Link>
                        <Link href="/host" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition">Host Dashboard</Link>
                        <Link href="/host/create" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-[#FF385C] hover:bg-neutral-50 transition">+ Create listing</Link>
                        <div className="my-1.5 border-t border-neutral-100" />
                        <button onClick={() => { logout(); setIsMenuOpen(false); router.push('/'); }} className="w-full text-left block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition">
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition">Log in or sign up</Link>
                        <div className="my-1 border-t border-neutral-100" />
                        <Link href="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">Explore homes</Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Tabs Row: shown only on mobile (<sm) when not scrolled */}
          {!isScrolled && (
            <div className="sm:hidden flex items-center justify-between px-1 py-1.5 border-t border-neutral-100">
              <nav aria-label="Mobile categories" className="flex items-center justify-between w-full gap-1 overflow-x-auto no-scrollbar">
                {navTabs.map(tab => {
                  const isSelected = activeTab === tab.name;
                  return (
                    <button 
                      key={tab.name}
                      onClick={() => handleTabClick(tab.name)}
                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-all shrink-0 ${
                        isSelected 
                          ? 'bg-neutral-900 text-white shadow-xs' 
                          : 'text-neutral-600 hover:bg-neutral-100 bg-neutral-50'
                      }`}
                    >
                      <span className="text-sm">{tab.icon}</span>
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Search Bar Floating Pill */}
          <div className={`overflow-visible transition-all duration-300 origin-top flex justify-center relative ${isScrolled ? 'h-0 opacity-0 mb-0 pointer-events-none' : 'h-[72px] sm:h-[84px] opacity-100 mb-3 sm:mb-4 pt-1 sm:pt-4'}`}>
            <div className={`flex w-full max-w-[850px] border border-neutral-300 rounded-full transition duration-200 items-center relative h-[56px] sm:h-[64px] ${activeDropdown ? 'bg-neutral-100' : 'bg-white shadow-sm hover:shadow-md'}`}>
              
              {/* Where Field */}
              <div 
                onClick={() => setActiveDropdown('where')}
                className={`flex-[1.4] py-1 sm:py-2 pl-4 sm:pl-8 pr-2 sm:pr-4 rounded-full cursor-pointer transition text-left h-full flex flex-col justify-center relative ${activeDropdown === 'where' ? 'bg-white shadow-[0_6px_20px_rgba(0,0,0,0.15)] z-10' : 'hover:bg-neutral-200'}`}
              >
                <div className="text-[11px] sm:text-[12px] font-bold text-neutral-900">Where</div>
                <input 
                  className="w-full p-0 bg-transparent border-0 text-[13px] sm:text-[14px] text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-0 truncate font-normal" 
                  placeholder={activeTab === 'Experiences' ? "Search by city or landmark" : "Search destinations"} 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()} 
                />
              </div>
              
              <div className="w-[1px] h-6 sm:h-8 bg-neutral-300" />
              
              {/* When Field */}
              <div 
                onClick={() => setActiveDropdown('when')}
                className={`flex-[1.2] py-2 px-6 rounded-full cursor-pointer transition text-left h-full hidden sm:flex flex-col justify-center relative ${activeDropdown === 'when' ? 'bg-white shadow-[0_6px_20px_rgba(0,0,0,0.15)] z-10' : 'hover:bg-neutral-200'}`}
              >
                <div className="text-[12px] font-bold text-neutral-900">When</div>
                <div className="text-[14px] text-neutral-500 font-normal truncate">
                  {getWhenDisplayText()}
                </div>
              </div>

              <div className="w-[1px] h-6 sm:h-8 bg-neutral-300 hidden sm:block" />

              {/* Who Field */}
              <div 
                onClick={() => setActiveDropdown('who')}
                className={`flex-[1.4] py-1 sm:py-2 pl-3 sm:pl-6 pr-1.5 sm:pr-2.5 flex items-center justify-between rounded-full cursor-pointer transition text-left h-full relative ${activeDropdown === 'who' ? 'bg-white shadow-[0_6px_20px_rgba(0,0,0,0.15)] z-10' : 'hover:bg-neutral-200'}`}
              >
                <div>
                  <div className="text-[11px] sm:text-[12px] font-bold text-neutral-900">{activeTab === 'Services' ? 'Service' : 'Who'}</div>
                  <div className="text-[12px] sm:text-[14px] text-neutral-500 font-normal truncate max-w-[85px] sm:max-w-[120px]">
                     {activeTab === 'Services' 
                       ? (selectedService || 'Add service') 
                       : (totalGuests > 0 ? `${totalGuests} guests${guests.infants > 0 ? `, ${guests.infants}i` : ''}` : 'Add guests')
                     }
                  </div>
                </div>
                <button 
                  className="h-10 sm:h-12 px-3 sm:px-5 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white flex items-center justify-center transition shadow-sm hover:scale-105 active:scale-95 ml-auto shrink-0 gap-1.5 sm:gap-2 font-semibold" 
                  title="Search" 
                  onClick={(e) => { e.stopPropagation(); handleSearch(); setActiveDropdown(null); }}
                >
                  <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="hidden md:inline">Search</span>
                </button>
              </div>

              {/* Render Dropdowns */}
              {activeDropdown === 'where' && (() => {
                const filteredDestinations = suggestedDestinations.filter(d => {
                  const matchesCat = destinationCategory === 'All' || d.category === destinationCategory;
                  const matchesSearch = !location.trim() || 
                    d.name.toLowerCase().includes(location.toLowerCase()) || 
                    d.desc.toLowerCase().includes(location.toLowerCase());
                  return matchesCat && matchesSearch;
                });

                return (
                  <div ref={dropdownRef} className="absolute top-[66px] sm:top-[80px] left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[calc(100vw-24px)] sm:w-[490px] max-w-[490px] bg-white rounded-3xl shadow-[0_6px_20px_rgba(0,0,0,0.2)] p-4 sm:p-6 z-50 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Search by destination</h3>
                      <span className="text-xs font-medium text-neutral-400">{filteredDestinations.length} destinations</span>
                    </div>

                    {/* Category Filter Pills (Place Scroll Categories) */}
                    <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
                      {['All', 'Cities', 'Beaches', 'Nature', 'Heritage'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setDestinationCategory(cat)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                            destinationCategory === cat
                              ? 'bg-neutral-900 text-white shadow-sm'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Smooth Place Scroll Area */}
                    <div className="max-h-[350px] overflow-y-auto space-y-1 pr-1 overscroll-contain">
                      {filteredDestinations.length > 0 ? (
                        filteredDestinations.map(dest => {
                          const isCurrent = Boolean(location.trim() && (
                            location.toLowerCase().includes(dest.query.toLowerCase()) || 
                            dest.name.toLowerCase().includes(location.toLowerCase())
                          ));
                          return (
                            <div 
                              key={dest.name} 
                              className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition group ${
                                isCurrent ? 'bg-neutral-100 border border-neutral-300' : 'hover:bg-neutral-100'
                              }`} 
                              onClick={() => { 
                                setLocation(dest.query === 'Nearby' ? '' : dest.query); 
                                setActiveDropdown('when'); 
                              }}
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 bg-neutral-100 border border-neutral-200 rounded-2xl flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition">
                                  {dest.icon}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-neutral-900">{dest.name}</div>
                                  <div className="text-xs text-neutral-500 line-clamp-1">{dest.desc}</div>
                                </div>
                              </div>
                              <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full shrink-0 ml-2">
                                {dest.tag}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-sm text-neutral-500">
                          No destinations match &quot;{location}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {activeDropdown === 'when' && (() => {
                const isDoubleMonth = activeTab === 'All' || activeTab === 'Homes';
                
                const renderMonth = (offset: number) => {
                  const monthDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1);
                  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
                  const startDay = monthDate.getDay();
                  
                  return (
                    <div className="flex-1 px-4">
                      <div className="text-center font-semibold mb-4">{monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                      <div className="grid grid-cols-7 text-center text-xs text-neutral-500 mb-2 font-medium">
                        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                      </div>
                      <div className="grid grid-cols-7 text-center text-sm gap-y-2">
                        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`}/>)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), i + 1);
                          const selected = isSelected(date);
                          const inRange = isInRange(date);
                          const past = isPast(date);
                          
                          return (
                            <div key={i} className="relative mx-auto w-full h-10 flex items-center justify-center">
                              {inRange && <div className="absolute inset-0 bg-neutral-100" />}
                              {(selected && checkIn && checkOut) && (
                                <div className={`absolute inset-0 bg-neutral-100 ${date.getTime() === checkIn.getTime() ? 'rounded-l-full' : 'rounded-r-full'}`} />
                              )}
                              <button 
                                type="button"
                                disabled={past}
                                onClick={() => handleDateClick(date)}
                                className={`relative w-10 h-10 flex items-center justify-center rounded-full transition ${
                                  past 
                                    ? 'text-neutral-300 cursor-not-allowed' 
                                    : selected 
                                      ? 'bg-black text-white font-semibold hover:bg-neutral-800 cursor-pointer' 
                                      : 'hover:border hover:border-black cursor-pointer text-neutral-800'
                                }`}
                              >
                                {i+1}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                };

                return isDoubleMonth ? (
                  <div ref={dropdownRef} className="absolute top-[66px] sm:top-[80px] left-1/2 -translate-x-1/2 w-[calc(100vw-24px)] sm:w-[850px] max-w-[850px] max-h-[82vh] overflow-y-auto bg-white rounded-3xl shadow-[0_6px_20px_rgba(0,0,0,0.2)] p-4 sm:p-8 z-50 flex flex-col border border-neutral-200" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center mb-6">
                      <div className="bg-neutral-100 p-1 rounded-full flex gap-1">
                        <button 
                          type="button"
                          onClick={() => setDateTab('Dates')} 
                          className={`px-6 py-2 rounded-full text-sm font-semibold transition cursor-pointer ${dateTab === 'Dates' ? 'bg-white shadow-sm text-black' : 'text-neutral-600 hover:bg-neutral-200'}`}
                        >
                          Dates
                        </button>
                        <button 
                          type="button"
                          onClick={() => setDateTab('Flexible')} 
                          className={`px-6 py-2 rounded-full text-sm font-semibold transition cursor-pointer ${dateTab === 'Flexible' ? 'bg-white shadow-sm text-black' : 'text-neutral-600 hover:bg-neutral-200'}`}
                        >
                          Flexible
                        </button>
                      </div>
                    </div>

                    {dateTab === 'Dates' ? (
                      <>
                        <div className="flex flex-col sm:flex-row relative gap-4">
                          <button onClick={handlePrevMonth} className="absolute left-2 top-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition z-10 cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                          </button>
                          <button onClick={handleNextMonth} className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition z-10 cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                          </button>
                          {renderMonth(0)}
                          <div className="hidden sm:block flex-1">
                            {renderMonth(1)}
                          </div>
                        </div>
                        <div className="mt-8 flex gap-2 flex-wrap justify-center">
                          {["Exact dates", "± 1 day", "± 2 days", "± 3 days", "± 7 days", "± 14 days"].map((btn) => (
                            <button key={btn} onClick={() => setFlexibility(btn)} className={`px-4 py-2 border rounded-full text-xs font-medium hover:border-black transition cursor-pointer ${flexibility === btn ? 'border-black bg-neutral-50' : 'border-neutral-300'}`}>{btn}</button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center py-2">
                        {/* How long would you like to stay? */}
                        <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-4">
                          How long would you like to stay?
                        </h3>
                        <div className="flex items-center justify-center gap-3 mb-8">
                          {(['Weekend', 'Week', 'Month'] as const).map((dur) => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => setFlexibleDuration(dur)}
                              className={`px-6 py-2 rounded-full text-sm transition cursor-pointer ${
                                flexibleDuration === dur
                                   ? 'border border-neutral-900 bg-white text-neutral-900 font-semibold shadow-sm'
                                   : 'border border-neutral-200 hover:border-neutral-400 text-neutral-700 bg-white font-normal'
                              }`}
                            >
                              {dur}
                            </button>
                          ))}
                        </div>

                        {/* When do you want to go? */}
                        <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-6">
                          When do you want to go?
                        </h3>
                        <div className="w-full flex items-center justify-center gap-2.5 relative">
                          {monthOffset > 0 && (
                            <button
                              type="button"
                              onClick={() => setMonthOffset(prev => Math.max(prev - 1, 0))}
                              className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:border-black hover:scale-105 flex items-center justify-center shadow-sm transition cursor-pointer shrink-0"
                              title="Previous months"
                            >
                              <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                              </svg>
                            </button>
                          )}

                          <div className="flex items-center gap-2.5">
                            {visibleMonths.map((m) => {
                              const isSelected = selectedMonths.includes(m.key);
                              return (
                                <div
                                  key={m.key}
                                  onClick={() => toggleMonth(m.key)}
                                  className={`w-[106px] h-[132px] rounded-2xl sm:rounded-3xl p-3 flex flex-col items-center justify-center cursor-pointer transition select-none ${
                                    isSelected
                                      ? 'border-2 border-black bg-neutral-50 shadow-sm'
                                      : 'border border-neutral-200 hover:border-black bg-white'
                                  }`}
                                >
                                  <svg className={`w-8 h-8 mb-2.5 transition ${isSelected ? 'text-black' : 'text-neutral-500'}`} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
                                    <rect x="3" y="5" width="18" height="15" rx="3" />
                                    <line x1="3" y1="9.5" x2="21" y2="9.5" />
                                    <line x1="7.5" y1="2.5" x2="7.5" y2="5.5" strokeLinecap="round" />
                                    <line x1="16.5" y1="2.5" x2="16.5" y2="5.5" strokeLinecap="round" />
                                  </svg>
                                  <span className="text-[13px] font-semibold text-neutral-900 text-center leading-tight">
                                    {m.name}
                                  </span>
                                  <span className="text-[11px] text-neutral-500 text-center mt-0.5">
                                    {m.year}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {monthOffset + 6 < allMonths.length && (
                            <button
                              type="button"
                              onClick={() => setMonthOffset(prev => Math.min(prev + 1, allMonths.length - 6))}
                              className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:border-black hover:scale-105 flex items-center justify-center shadow-sm transition cursor-pointer shrink-0"
                              title="Next months"
                            >
                              <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div ref={dropdownRef} className="absolute top-[66px] sm:top-[80px] left-1/2 -translate-x-1/2 w-[calc(100vw-24px)] sm:w-[750px] max-w-[750px] max-h-[82vh] overflow-y-auto bg-white rounded-3xl shadow-[0_6px_20px_rgba(0,0,0,0.2)] p-4 sm:p-8 z-50 flex flex-col sm:flex-row border border-neutral-200" onClick={(e) => e.stopPropagation()}>
                    {/* Left Sidebar */}
                    <div className="w-full sm:w-1/3 sm:pr-8 flex flex-row sm:flex-col gap-2 sm:gap-4 border-b sm:border-b-0 sm:border-r border-neutral-200 pb-3 sm:pb-0 mb-3 sm:mb-0">
                       <div className="flex-1 p-3 sm:p-4 border border-neutral-200 rounded-xl hover:border-black cursor-pointer transition" onClick={() => { const today = new Date(new Date().setHours(0,0,0,0)); setCheckIn(today); setCheckOut(today); }}>
                         <div className="font-semibold text-xs sm:text-base text-neutral-800">Today</div>
                         <div className="text-xs sm:text-sm text-neutral-500">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                       </div>
                       <div className="flex-1 p-3 sm:p-4 border border-neutral-200 rounded-xl hover:border-black cursor-pointer transition" onClick={() => { const tmr = new Date(new Date().setHours(0,0,0,0)); tmr.setDate(tmr.getDate() + 1); setCheckIn(tmr); setCheckOut(tmr); }}>
                         <div className="font-semibold text-xs sm:text-base text-neutral-800">Tomorrow</div>
                         <div className="text-xs sm:text-sm text-neutral-500">{(() => { const tmr = new Date(); tmr.setDate(tmr.getDate() + 1); return tmr.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) })()}</div>
                       </div>
                    </div>

                    {/* Calendar Area */}
                    <div className="w-full sm:w-2/3 sm:pl-4 flex flex-col relative">
                      <button onClick={handlePrevMonth} className="absolute left-6 top-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition z-10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                      </button>
                      <button onClick={handleNextMonth} className="absolute right-6 top-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition z-10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </button>
                      {renderMonth(0)}
                    </div>
                  </div>
                );
              })()}

              {activeDropdown === 'who' && activeTab !== 'Services' && (
                <div ref={dropdownRef} className="absolute top-[66px] sm:top-[80px] left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-[calc(100vw-24px)] sm:w-[400px] max-w-[400px] bg-white rounded-3xl shadow-[0_6px_20px_rgba(0,0,0,0.2)] p-5 sm:p-6 z-50 border border-neutral-200" onClick={(e) => e.stopPropagation()}>
                  {[
                    { key: 'adults', title: 'Adults', desc: 'Ages 13 or above' },
                    { key: 'children', title: 'Children', desc: 'Ages 2–12' },
                    { key: 'infants', title: 'Infants', desc: 'Under 2' },
                    { key: 'pets', title: 'Pets', desc: 'Bringing a service animal?' },
                  ].map((type, idx) => (
                    <div key={type.key} className={`flex items-center justify-between py-4 ${idx !== 0 ? 'border-t border-neutral-200' : ''}`}>
                      <div>
                        <div className="font-semibold text-neutral-800">{type.title}</div>
                        <div className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-2 cursor-pointer">{type.desc}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setGuests(p => ({ ...p, [type.key]: Math.max(0, p[type.key as keyof typeof p] - 1) }))}
                          className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black disabled:opacity-30 disabled:hover:border-neutral-300 disabled:cursor-not-allowed transition"
                          disabled={guests[type.key as keyof typeof guests] === 0}
                        >-</button>
                        <span className="w-4 text-center tabular-nums">{guests[type.key as keyof typeof guests]}</span>
                        <button 
                          onClick={() => setGuests(p => ({ ...p, [type.key]: p[type.key as keyof typeof p] + 1 }))}
                          className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black transition"
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeDropdown === 'who' && activeTab === 'Services' && (
                <div ref={dropdownRef} className="absolute top-[66px] sm:top-[80px] left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-[calc(100vw-24px)] sm:w-[500px] max-w-[500px] bg-white rounded-3xl shadow-[0_6px_20px_rgba(0,0,0,0.2)] p-4 sm:p-6 z-50 border border-neutral-200" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {[
                      { icon: '📸', name: 'Photography' },
                      { icon: '🧑‍🍳', name: 'Chefs' },
                      { icon: '💆', name: 'Massage' },
                      { icon: '🍱', name: 'Prepared meals' },
                      { icon: '⏱️', name: 'Training' },
                      { icon: '💄', name: 'Make-up' },
                      { icon: '✂️', name: 'Hair' },
                      { icon: '🧖', name: 'Spa treatments' },
                      { icon: '🍽️', name: 'Catering' }
                    ].map((service) => (
                      <button 
                        key={service.name} 
                        onClick={() => {
                          setSelectedService(service.name);
                          setActiveDropdown(null);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium hover:border-black transition ${
                          selectedService === service.name ? 'border-black bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-800'
                        }`}
                      >
                        <span>{service.icon}</span>
                        <span>{service.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </header>
    </>
  );
}
