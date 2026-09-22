const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;


/**
 * Register a new citizen user
 */
export const register = async (email, password, firstName, lastName) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  // If successful, save token and user info to localStorage
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
};

/**
 * Login user
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  // If successful, save token and user info to localStorage
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
};

/**
 * Logout user (clears session storage)
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

/**
 * Check if user is logged in with valid non-expired token and profile
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || token === 'undefined' || token === 'null' || !token.trim()) {
    logout();
    return false;
  }
  if (!user || user === 'undefined' || user === 'null') {
    logout();
    return false;
  }

  if (isTokenExpired(token)) {
    logout();
    return false;
  }

  try {
    const parsed = JSON.parse(user);
    if (!parsed || !parsed.id) {
      logout();
      return false;
    }
    return true;
  } catch {
    logout();
    return false;
  }
};

/**
 * Get current user info from localStorage safely
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined' || user === 'null') return null;
    return JSON.parse(user);
  } catch {
    return null;
  }
};
