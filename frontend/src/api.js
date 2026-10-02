export const API_BASE_URL = 'https://jaldrishti-sih2026.onrender.com';

export const apiFetch = (endpoint, options = {}) => {
  return fetch(`${API_BASE_URL}${endpoint}`, options);
};