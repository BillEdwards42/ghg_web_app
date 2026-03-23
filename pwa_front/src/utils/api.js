import axios from 'axios';

// Centralized API configuration for efficient reuse across the entire frontend
// Using a relative path so mobile devices checking `--host` can hit the Vite proxy safely
export const API_BASE_URL = '/api';

// Create a pre-configured Axios client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
