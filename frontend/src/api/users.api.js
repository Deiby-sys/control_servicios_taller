// api usuarios

import axios from './api/axios';

export const getUsers = async () => {
  return await axios.get('/api/users');
};

export const getResponsiblesList = async () => {
  return await axios.get('/api/users/responsibles');
};