import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Robust local/hosted base: use 127.0.0.1 in dev, same-origin otherwise
  const API_BASE = (() => {
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const isLocal = host === 'https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app/auth' || host === 'https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app/auth';
      return (isLocal ? 'https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app/auth' : '') + '/api/auth';
    } catch (_) {
      return 'https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app/api/auth';
    }
  })();
  const signup = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message = (data && (data.error || data.message)) || `Signup failed (${res.status})`;
        return { success: false, error: message };
      }
      return data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Signup error:', err);
      return { success: false, error: err?.message || 'Network error' };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message = (data && (data.error || data.message)) || `Login failed (${res.status})`;
        return { success: false, error: message };
      }
      return data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Login error:', err);
      return { success: false, error: err?.message || 'Network error' };
    }
  };

  return (
    <AuthContext.Provider value={{ login, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
