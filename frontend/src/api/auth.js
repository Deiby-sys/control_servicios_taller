import axios from 'axios';

// La URL base del backend
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return process.env.NODE_ENV === 'production'
    ? 'https://control-servicios-taller.onrender.com'
    : 'http://localhost:4000';
};

const API = getApiBaseUrl();

export const registerRequest = (user) =>
  axios.post(`${API}/api/auth/register`, user, {
    withCredentials: true
  });

export const loginRequest = (user) =>
  axios.post(`${API}/api/auth/login`, user, {
    withCredentials: true
  });

export const verifyAuth = () =>
  axios.get(`${API}/api/auth/verify`, {
    withCredentials: true
  });