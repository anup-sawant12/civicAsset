import api from './api';

export const complaintService = {
  /**
   * Fetch paginated complaints with search and filtering
   * @param {Object} params - { page, limit, search, status, category, severity, priority, departmentId, assetId }
   */
  async getComplaints(params = {}) {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  /**
   * Fetch aggregate complaint statistics for counters & dashboard widgets
   */
  async getComplaintStats() {
    const response = await api.get('/complaints/stats');
    return response.data;
  },

  /**
   * Fetch full details for a single complaint
   * @param {string} id
   */
  async getComplaintById(id) {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  /**
   * Submit a new citizen complaint
   * @param {Object} data - { category, description, severity, latitude, longitude, address, assetId, imageUrl }
   */
  async createComplaint(data) {
    const response = await api.post('/complaints', data);
    return response.data;
  },

  /**
   * Update complaint content
   * @param {string} id
   * @param {Object} data
   */
  async updateComplaint(id, data) {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data;
  },

  /**
   * Patch complaint processing status
   * @param {string} id
   * @param {string} status - SUBMITTED, UNDER_REVIEW, ASSIGNED, IN_PROGRESS, RESOLVED, VERIFIED, CLOSED, REJECTED
   */
  async updateComplaintStatus(id, status) {
    const response = await api.patch(`/complaints/${id}/status`, { status });
    return response.data;
  },

  /**
   * Patch municipal priority
   * @param {string} id
   * @param {string} priority - LOW, MEDIUM, HIGH, URGENT
   */
  async updateComplaintPriority(id, priority) {
    const response = await api.patch(`/complaints/${id}/priority`, { priority });
    return response.data;
  },

  /**
   * Patch complaint severity
   * @param {string} id
   * @param {string} severity - LOW, MEDIUM, HIGH, CRITICAL
   */
  async updateComplaintSeverity(id, severity) {
    const response = await api.patch(`/complaints/${id}/severity`, { severity });
    return response.data;
  },

  /**
   * Reassign or route complaint to a municipal department
   * @param {string} id
   * @param {string} departmentId
   */
  async updateComplaintDepartment(id, departmentId) {
    const response = await api.patch(`/complaints/${id}/department`, { departmentId });
    return response.data;
  },

  /**
   * Cancel complaint (soft cancellation)
   * @param {string} id
   */
  async cancelComplaint(id) {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },
};

export default complaintService;
