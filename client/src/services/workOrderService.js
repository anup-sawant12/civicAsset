import api from './api';

export const workOrderService = {
  /**
   * Fetch work orders with optional filtering & pagination
   * params: { page, limit, search, status, departmentId, assignedWorkerId, assignedOfficerId, complaintId, assetId, slaBreached }
   */
  async getWorkOrders(params = {}) {
    const response = await api.get('/work-orders', { params });
    return response.data;
  },

  /**
   * Fetch work order KPI statistics
   */
  async getWorkOrderStats() {
    const response = await api.get('/work-orders/stats');
    return response.data;
  },

  /**
   * Fetch full details for a single work order by ID
   */
  async getWorkOrderById(id) {
    const response = await api.get(`/work-orders/${id}`);
    return response.data;
  },

  /**
   * Create a new work order from a complaint
   * data: { complaintId, assetId, departmentId, assignedWorkerId, assignedOfficerId, slaDeadline, slaHours, beforeImageUrl }
   */
  async createWorkOrder(data) {
    const response = await api.post('/work-orders', data);
    return response.data;
  },

  /**
   * Update operational details on a work order (Admin / Officer)
   */
  async updateWorkOrder(id, data) {
    const response = await api.put(`/work-orders/${id}`, data);
    return response.data;
  },

  /**
   * Update work order lifecycle status
   * data: { status, rejectionReason }
   */
  async updateWorkOrderStatus(id, status, extraData = {}) {
    const response = await api.patch(`/work-orders/${id}/status`, {
      status,
      ...extraData,
    });
    return response.data;
  },

  /**
   * Assign or reassign a field worker
   */
  async assignWorker(id, assignedWorkerId) {
    const response = await api.patch(`/work-orders/${id}/assign`, {
      assignedWorkerId,
    });
    return response.data;
  },

  /**
   * Assign or reassign an officer
   */
  async assignOfficer(id, assignedOfficerId) {
    const response = await api.patch(`/work-orders/${id}/assign-officer`, {
      assignedOfficerId,
    });
    return response.data;
  },

  /**
   * Start work on an assigned work order (Field Worker / Officer / Admin)
   */
  async startWork(id) {
    const response = await api.patch(`/work-orders/${id}/start`);
    return response.data;
  },

  /**
   * Mark work as completed with repair notes and optional after-repair photo
   * data: { repairNotes, afterImage, afterImageUrl }
   */
  async completeWork(id, data) {
    const response = await api.patch(`/work-orders/${id}/complete`, data);
    return response.data;
  },

  /**
   * Cancel a work order with optional justification
   */
  async cancelWorkOrder(id, reason) {
    const response = await api.delete(`/work-orders/${id}`, {
      data: { reason },
    });
    return response.data;
  },
};

export default workOrderService;
