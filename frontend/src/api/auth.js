// src/api/auth.js

import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    return envUrl.trim(); // ← ¡elimina espacios!
  }
  return process.env.NODE_ENV === 'production'
    ? 'https://taller-backend-7oz8.onrender.com'
    : 'http://localhost:4000';
};

const API_BASE = getApiBaseUrl();

export const registerRequest = (user) =>
  axios.post(`${API_BASE}/api/auth/register`, user, { withCredentials: true });

export const loginRequest = (user) =>
  axios.post(`${API_BASE}/api/auth/login`, user, { withCredentials: true });

export const verifyAuth = () =>
  axios.get(`${API_BASE}/api/auth/verify`, { withCredentials: true });