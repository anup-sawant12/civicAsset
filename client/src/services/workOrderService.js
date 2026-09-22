const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/work-orders`;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Session expired. Please sign in again.');
  }
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const getWorkOrders = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_URL}?${query}`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await handleResponse(response);
  return data.workOrders;
};

export const getWorkOrderById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await handleResponse(response);
  return data.workOrder;
};

export const createWorkOrder = async (orderData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(orderData)
  });
  const data = await handleResponse(response);
  return data.workOrder;
};

export const updateWorkOrder = async (id, updateData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updateData)
  });
  const data = await handleResponse(response);
  return data.workOrder;
};

export const getWorkers = async () => {
  const response = await fetch(`${API_URL}/workers`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await handleResponse(response);
  return data.workers;
};
