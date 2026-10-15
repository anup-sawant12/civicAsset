import api from './api';

export const assetService = {
  /**
   * Fetch assets with pagination, search, and combined filtering
   * @param {Object} params - { page, limit, search, assetType, status, condition, riskLevel, departmentId }
   */
  async getAssets(params = {}) {
    const response = await api.get('/assets', { params });
    return response.data;
  },

  /**
   * Fetch lightweight asset markers and stats for GIS mapping
   * @param {Object} params - { search, assetType, status, condition, riskLevel, departmentId }
   */
  async getMapAssets(params = {}) {
    const response = await api.get('/assets/map', { params });
    return response.data;
  },

  /**
   * Fetch complete information for a single asset
   * @param {string} id
   */
  async getAssetById(id) {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  /**
   * Create a new infrastructure asset
   * @param {Object} data
   */
  async createAsset(data) {
    const response = await api.post('/assets', data);
    return response.data;
  },

  /**
   * Update full asset details
   * @param {string} id
   * @param {Object} data
   */
  async updateAsset(id, data) {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },

  /**
   * Patch asset operational status
   * @param {string} id
   * @param {string} status - OPERATIONAL, UNDER_MAINTENANCE, DAMAGED, INACTIVE, RETIRED
   */
  async updateAssetStatus(id, status) {
    const response = await api.patch(`/assets/${id}/status`, { status });
    return response.data;
  },

  /**
   * Patch asset physical condition
   * @param {string} id
   * @param {string} condition - EXCELLENT, GOOD, FAIR, POOR, CRITICAL
   */
  async updateAssetCondition(id, condition) {
    const response = await api.patch(`/assets/${id}/condition`, { condition });
    return response.data;
  },

  /**
   * Controlled asset retirement (preserves historical relations)
   * @param {string} id
   */
  async retireAsset(id) {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },
};

export default assetService;
