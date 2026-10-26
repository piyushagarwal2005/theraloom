import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [therapist, setTherapist] = useState(() => {
    const saved = localStorage.getItem('theraloom_therapist');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('theraloom_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setTherapist(res.data.therapist);
            localStorage.setItem('theraloom_therapist', JSON.stringify(res.data.therapist));
          }
        } catch (err) {
          console.warn('[AuthContext] Session invalid:', err.message);
          setTherapist(null);
          setToken(null);
          localStorage.removeItem('theraloom_token');
          localStorage.removeItem('theraloom_therapist');
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      setToken(res.data.token);
      setTherapist(res.data.therapist);
      localStorage.setItem('theraloom_token', res.data.token);
      localStorage.setItem('theraloom_therapist', JSON.stringify(res.data.therapist));
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data?.success) {
      setToken(res.data.token);
      setTherapist(res.data.therapist);
      localStorage.setItem('theraloom_token', res.data.token);
      localStorage.setItem('theraloom_therapist', JSON.stringify(res.data.therapist));
      return res.data;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    } finally {
      setToken(null);
      setTherapist(null);
      localStorage.removeItem('theraloom_token');
      localStorage.removeItem('theraloom_therapist');
    }
  };

  const updateTherapist = (updated) => {
    setTherapist((prev) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('theraloom_therapist', JSON.stringify(merged));
      return merged;
    });
  };

  const refreshTherapist = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setTherapist(res.data.therapist);
        localStorage.setItem('theraloom_therapist', JSON.stringify(res.data.therapist));
      }
    } catch (err) {
      console.warn('Failed to refresh therapist profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        therapist,
        token,
        loading,
        isAuthenticated: !!therapist && !!token,
        login,
        register,
        logout,
        updateTherapist,
        refreshTherapist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
