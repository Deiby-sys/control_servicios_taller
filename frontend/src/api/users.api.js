// api usuarios

import { getUsersRequest, getResponsiblesListRequest } from './auth';

export const getUsers = () => getUsersRequest();
export const getResponsiblesList = () => getResponsiblesListRequest();