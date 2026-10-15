import api from './api';

/**
 * Auth Service to interact with backend authentication endpoints
 */
export const authService = {
  /**
   * Register a new Citizen user
   * @param {{ firstName, lastName, email, password, phone }} userData
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Log in user with credentials
   * @param {{ email, password }} credentials
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Retrieve current authenticated user profile
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
