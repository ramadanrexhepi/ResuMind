import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // API base URL configuration
  const API_BASE = (() => {
    try {
      // Check if we're in development or production
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const isLocal = host === 'localhost' || host === '127.0.0.1';

      // Use environment variable if available, otherwise use defaults
      if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL + '/api/auth';
      }

      // Development: use local backend
      if (isLocal) {
        return 'http://localhost:5050/api/auth';
      }

      // Production: fallback to custom domain
      // You should set REACT_APP_API_URL in Vercel environment variables
      return 'https://api.resumind.ramadanrexhepi.dev/api/auth';
    } catch (_) {
      return 'http://localhost:5050/api/auth';
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
