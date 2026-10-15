import api from './api';

export const userService = {
  /**
   * Fetch users with optional filtering: { role, status, departmentId, search }
   */
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Fetch single user details
   */
  async getUser(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user (OFFICER, FIELD_WORKER, CITIZEN)
   */
  async createUser(data) {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  /**
   * Update user details
   */
  async updateUser(id, data) {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  /**
   * Update user status (ACTIVE, INACTIVE, SUSPENDED)
   */
  async updateUserStatus(id, status) {
    const response = await api.put(`/admin/users/${id}/status`, { status });
    return response.data;
  },
};

export default userService;
