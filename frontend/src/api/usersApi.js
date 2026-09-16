// API para usuarios
// src/api/usersApi.js
import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl) return envUrl.trim();

  return import.meta.env.MODE === 'production'
    ? 'https://api.mytallerapp.com'
    : 'http://localhost:4000';
};

const usersApi = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  withCredentials: true,
});

export const getUsersRequest = () => usersApi.get('/users');