import { saveToken, removeToken } from '../utils/auth';
import { apiGet, apiPost } from './api';

export const registerCustomer = async (customerData) => {
  const payload = {
    firstName: customerData.firstName,
    lastName: customerData.lastName,
    email: customerData.email,
    phone: customerData.phone,
    password: customerData.password,
  };

  const data = await apiPost('customer/register', payload);

  if (data.token) {
    saveToken(data.token);
  }

  return data;
};

export const loginCustomer = async (credentials) => {
  const data = await apiPost('customer/login', credentials);

  if (data.token) {
    saveToken(data.token);
  }

  return data;
};

export const getCustomerProfile = async () => {
  return apiGet('customer/profile');
};

export const logoutCustomer = () => {
  removeToken();
};
