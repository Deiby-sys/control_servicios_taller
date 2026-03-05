// Importa y usa la api usuarios usersApi.js

// src/api/usuarios.js
import { getUsersRequest, getResponsiblesListRequest } from './usersApi';

export const getUsers = () => getUsersRequest();
export const getResponsiblesList = () => getResponsiblesListRequest();