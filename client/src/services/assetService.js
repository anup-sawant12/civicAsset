const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/assets`;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const getAssets = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_URL}?${query}`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch assets');
  return data.assets;
};

export const getAssetById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch asset');
  return data.asset;
};

export const createAsset = async (assetData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(assetData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create asset');
  return data;
};

export const updateAsset = async (id, assetData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(assetData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update asset');
  return data;
};

export const deleteAsset = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete asset');
  return data;
};

export const getDepartments = async () => {
  const response = await fetch(`${API_URL}/departments`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch departments');
  return data.departments;
};
