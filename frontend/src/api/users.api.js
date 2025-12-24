// api usuarios

import axios from './axios.js';

export const getUsers = async () => {
  return await axios.get('/api/users');
};

export const getResponsiblesList = async () => {
  return await axios.get('/api/users/responsibles');
};