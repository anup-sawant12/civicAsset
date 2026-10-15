import api from './api';

export const departmentService = {
  /**
   * Fetch all departments with user and asset counts
   */
  async getDepartments(params = {}) {
    const response = await api.get('/admin/departments', { params });
    return response.data;
  },

  /**
   * Fetch single department with staff
   */
  async getDepartment(id) {
    const response = await api.get(`/admin/departments/${id}`);
    return response.data;
  },

  /**
   * Create a new municipal department
   */
  async createDepartment(data) {
    const response = await api.post('/admin/departments', data);
    return response.data;
  },

  /**
   * Update department name or description
   */
  async updateDepartment(id, data) {
    const response = await api.put(`/admin/departments/${id}`, data);
    return response.data;
  },

  /**
   * Activate or deactivate department
   */
  async updateDepartmentStatus(id, isActive) {
    const response = await api.put(`/admin/departments/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Safe delete department
   */
  async deleteDepartment(id) {
    const response = await api.delete(`/admin/departments/${id}`);
    return response.data;
  },
};

export default departmentService;
