import axios from 'axios';

// Resolve API base URL dynamically
const getBaseURL = () => {
  const isProductionHost =
    typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('github.io') ||
      window.location.hostname.endsWith('vercel.app'));

  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // On production hosting (GitHub Pages or Vercel), always route to the live Render backend
  if (isProductionHost && (!envUrl || envUrl.includes('localhost'))) {
    return 'https://theraloom-api.onrender.com/api/v1';
  }

  return envUrl || 'https://theraloom-api.onrender.com/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('theraloom_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.includes('/dashboard')) {
        localStorage.removeItem('theraloom_token');
        localStorage.removeItem('theraloom_therapist');
        const isGitHubPages =
          typeof window !== 'undefined' &&
          window.location.hostname.endsWith('github.io');
        const repoPrefix = isGitHubPages ? '/theraloom-live' : '';
        window.location.href = `${repoPrefix}/login?expired=true`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
