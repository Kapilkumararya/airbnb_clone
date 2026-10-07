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
            <svg className="h-8 w-8 text-[#FF385C] shrink-0 transition-transform group-hover:scale-105" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.953l.558 1.089.08.159c2.041 4.004 3.821 7.608 5.279 10.794l.026.025.533 1.22.318.764c.243.613.294 1.222.213 1.858zm1.22-2.39c-.186-.583-.505-1.271-.9-2.094v-.03c-1.889-4.006-3.642-7.608-5.307-10.844l-.111-.163C15.317 1.461 14.468 0 12.001 0c-2.44 0-3.476 1.695-4.535 3.898l-.081.16c-1.669 3.236-3.421 6.843-5.303 10.847v.053l-.559 1.22c-.21.504-.317.768-.345.847C-.172 20.74 2.611 24 5.98 24c.027 0 .132 0 .265-.027h.372c1.75-.213 3.554-1.325 5.384-3.317 1.829 1.989 3.635 3.104 5.382 3.317h.372c.133.027.239.027.265.027 3.37.003 6.152-3.261 4.802-6.975z" />
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
