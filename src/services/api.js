import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  getAuthUrl: () => api.get('/auth/url'),
  handleCallback: (code) => api.post('/auth/callback', { code }),
  getStatus: () => api.get('/auth/status'),
  logout: () => api.post('/auth/logout'),
};

export const emailAPI = {
  getClusters: () => api.get('/emails/clusters'),
  archiveEmails: (emailIds) => api.post('/emails/archive', { emailIds }),
};

export default api;