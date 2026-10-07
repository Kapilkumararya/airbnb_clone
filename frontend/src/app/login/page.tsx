"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, loginDemo } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name.trim()) return setError('Please enter your full name.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      setSuccess(true);
      setTimeout(() => router.push('/'), 1200);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cities = [
    { name: "TORONTO", img: "https://images.unsplash.com/photo-1507992781348-310259076fa2?auto=format&fit=crop&w=600&q=80" },
    { name: "PARIS", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80" },
    { name: "MIAMI", img: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80" },
    { name: "BUDAPEST", img: "https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=600&q=80" },
    { name: "MONTRÉAL", img: "https://images.unsplash.com/photo-1519178173456-e41c49e29088?auto=format&fit=crop&w=600&q=80" },
    { name: "SAN DIEGO", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80" },
    { name: "PERTH", img: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80" },
    { name: "EDINBURGH", img: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=600&q=80" },
    { name: "MEDELLÍN", img: "https://images.unsplash.com/photo-1599837565318-67429bde7162?auto=format&fit=crop&w=600&q=80" },
    { name: "CIUDAD DE MÉXICO", img: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=600&q=80" },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col font-sans relative overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-neutral-200 z-30">
        <div className="max-w-[1780px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <svg className="h-8 w-8 text-[#FF385C] transition-transform group-hover:scale-105" fill="currentColor" viewBox="0 0 32 32">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.479.96 3.525.127 2.635-.91 5.093-2.84 6.745C24.78 32.324 22.127 33 19.34 33c-2.316 0-4.434-.567-6.077-1.636l-.377-.258c-.302-.216-.583-.45-.886-.713-.303.263-.584.497-.886.713l-.377.258C8.995 32.433 6.877 33 4.561 33c-2.788 0-5.44-.676-7.31-2.272-1.93-1.652-2.967-4.11-2.84-6.745.05-1.046.293-1.934.96-3.525l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C4.437 1.963 5.892 1 7.9 1z" />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-[#FF385C]">airbnb</span>
          </Link>

          <Link
            href="/"
            className="w-10 h-10 border border-neutral-300 rounded-full flex items-center justify-center text-neutral-700 bg-white hover:bg-neutral-50 transition"
            title="Back to home"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </header>

      {/* City Background */}
      <div className="absolute inset-0 top-20 opacity-80 filter blur-[2px] scale-105 pointer-events-none grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 p-8 overflow-hidden">
        {cities.map((c, i) => (
          <div key={i} className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
              <span className="font-extrabold tracking-wider text-white text-xl uppercase drop-shadow-md">{c.name}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 top-20 bg-black/25 backdrop-blur-sm z-10" />

      {/* Modal Card */}
      <div className="relative z-20 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[490px] bg-white rounded-[32px] p-8 sm:p-11 shadow-2xl border border-white/40 animate-in fade-in zoom-in-95 duration-200">

          {/* Mode Toggle */}
          <div className="flex bg-neutral-100 rounded-full p-1 mb-8">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${mode === 'login' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Log in
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${mode === 'signup' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Sign up
            </button>
          </div>

          {/* Quick Demo Invigilator Access */}
          <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span>🧪</span> Evaluation Assignment Mode
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Preloaded
              </span>
            </div>
            <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
              Instantly jump into the preloaded dummy account with 3 completed trips &amp; 3 hosted listings to test all features.
            </p>
            <button
              type="button"
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                setError('');
                try {
                  await loginDemo();
                  setSuccess(true);
                  setTimeout(() => router.push('/'), 700);
                } catch (e: any) {
                  setError(e.message || 'Failed to log into demo account');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>⚡ Log in as Demo Invigilator (1-Click)</span>
            </button>
          </div>

          <div className="relative flex py-1.5 items-center mb-5">
            <div className="flex-grow border-t border-neutral-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">or continue below</span>
            <div className="flex-grow border-t border-neutral-200"></div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#222222] mb-6 text-center">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>

          {success ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 space-y-1 text-center">
              <p className="font-bold text-base">🎉 {mode === 'login' ? 'Welcome back!' : 'Account created!'}</p>
              <p className="text-xs text-emerald-600">Redirecting you now...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-3.5 border border-neutral-300 rounded-xl text-base text-[#222222] placeholder-neutral-500 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              )}

              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3.5 border border-neutral-300 rounded-xl text-base text-[#222222] placeholder-neutral-500 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />

              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3.5 border border-neutral-300 rounded-xl text-base text-[#222222] placeholder-neutral-500 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />

              {mode === 'signup' && (
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3.5 border border-neutral-300 rounded-xl text-base text-[#222222] placeholder-neutral-500 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#E00B41] hover:bg-[#D70466] active:scale-[0.98] text-white rounded-xl font-semibold text-base shadow-sm transition disabled:opacity-50"
              >
                {isLoading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Log in' : 'Sign up')}
              </button>

              {mode === 'login' && (
                <p className="text-center text-sm text-neutral-500 pt-2">
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-neutral-900 font-semibold hover:underline">
                    Sign up
                  </button>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
