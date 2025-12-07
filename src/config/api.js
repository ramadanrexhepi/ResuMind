/**
 * Centralized API Configuration
 *
 * Production URLs:
 * - Frontend: https://resumind.ramadanrexhepi.dev (Vercel)
 * - Backend: https://api.resumind.ramadanrexhepi.dev (Render)
 */

const getAPIBaseURL = () => {
  // Check if we're in development (localhost)
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Use environment variable if available (set in Vercel)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Development: use local backend
  if (isLocalhost) {
    return 'http://localhost:5050';
  }

  // Production fallback: use direct Render URL (works immediately)
  // TODO: Change to https://api.resumind.ramadanrexhepi.dev after DNS is set up
  return 'https://resumind-vlu4.onrender.com';
};

export const API_BASE_URL = getAPIBaseURL();

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,

  // Analysis
  ANALYZE_FILE: `${API_BASE_URL}/api/analyze/file-robust`,
  ANALYZE_LINKEDIN: `${API_BASE_URL}/api/analyze/linkedin`,
  SAVE_ANALYSIS: `${API_BASE_URL}/api/analyses/save`,

  // Generation
  GENERATE_RESUME: `${API_BASE_URL}/api/generate/resume-from-scratch`,
  GENERATE_OPTIMIZED: `${API_BASE_URL}/api/generate/resume-optimized`,
  GENERATE_PREVIEW: `${API_BASE_URL}/api/generate/resume-preview`,

  // User
  USER_ANALYSES: (userId) => `${API_BASE_URL}/api/user/analyses/${userId}`,

  // Health
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;
