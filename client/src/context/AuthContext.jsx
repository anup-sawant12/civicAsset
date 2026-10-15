import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContextInstance';
import authService from '../services/authService';

const TOKEN_KEY = 'civicasset_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Initialize and restore session
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const data = await authService.getCurrentUser();
        if (isMounted && data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        logout();
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    restoreSession();

    // Listen to unauthorized events from Axios interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Login handler
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  // Register handler
  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
