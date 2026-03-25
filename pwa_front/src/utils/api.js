import axios from 'axios';

export const API_BASE_URL = 'https://dev-carbon64.lndata.com/frontend_api';
export const SYSTEM_ID = 1;

// Helper to encode password to Base64 as required by the backend
export const encodePassword = (password) => {
  try {
    return window.btoa(password);
  } catch (e) {
    console.error('Failed to encode password', e);
    return password;
  }
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-esg-system': SYSTEM_ID
  }
});

// Helper to set the auth token for all future requests automatically
export const setAuthHeaders = (token) => {
  if (token) {
    apiClient.defaults.headers.common['X-Auth-Token'] = token;
  } else {
    delete apiClient.defaults.headers.common['X-Auth-Token'];
  }
};
