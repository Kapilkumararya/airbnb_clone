"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persist = (token: string, user: User) => {
    localStorage.setItem('airbnb_token', token);
    localStorage.setItem('airbnb_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  // On mount, rehydrate from localStorage or auto-login with Demo Invigilator for first-time visitors
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('airbnb_token');
        const storedUser = localStorage.getItem('airbnb_user');
        const loggedOut = localStorage.getItem('airbnb_logged_out');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsLoading(false);
          return;
        }

        // Auto-login dummy account on first visit if user hasn't explicitly logged out
        if (!loggedOut) {
          try {
            const res = await fetch(`${API}/auth/demo`);
            if (res.ok) {
              const data = await res.json();
              persist(data.access_token, data.user);
            }
          } catch (err) {
            console.error('Demo auto-login failed:', err);
          }
        }
      } catch {
        /* ignore parse errors */
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginDemo = useCallback(async () => {
    try {
      const res = await fetch(`${API}/auth/demo`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Demo login failed');
      localStorage.removeItem('airbnb_logged_out');
      persist(data.access_token, data.user);
    } catch (err) {
      console.error('Failed to log into demo account:', err);
      throw err;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    localStorage.removeItem('airbnb_logged_out');
    persist(data.access_token, data.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Signup failed');
    localStorage.removeItem('airbnb_logged_out');
    persist(data.access_token, data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('airbnb_token');
    localStorage.removeItem('airbnb_user');
    localStorage.setItem('airbnb_logged_out', 'true');
    setToken(null);
    setUser(null);
  }, []);

  const isDemoUser = !!(user && (user.email === 'invigilator@airbnb.com' || user.name?.includes('Dummy')));

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, loginDemo, logout, isDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
