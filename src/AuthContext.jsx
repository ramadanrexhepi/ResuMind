import React, { createContext, useContext } from 'react';
import { API_ENDPOINTS } from './config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const signup = async (name, email, password) => {
    try {
      const res = await fetch(API_ENDPOINTS.SIGNUP, {
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
      const res = await fetch(API_ENDPOINTS.LOGIN, {
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
