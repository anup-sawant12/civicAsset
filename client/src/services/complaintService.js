const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints`;

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

export const getComplaints = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_URL}?${query}`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await handleResponse(response);
  return data.complaints;
};

export const getComplaintById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await handleResponse(response);
  return data.complaint;
};

export const createComplaint = async (complaintData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(complaintData)
  });
  const data = await handleResponse(response);
  return data.complaint;
};

export const updateComplaint = async (id, complaintData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(complaintData)
  });
  const data = await handleResponse(response);
  return data.complaint;
};

export const deleteComplaint = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await handleResponse(response);
  return data;
};
