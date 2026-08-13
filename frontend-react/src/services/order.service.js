import { authFetch } from './api';

export const createOrder = async (orderData) => {
  return authFetch('customer/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
};

export const getMyOrders = async () => {
  return authFetch('customer/orders', {
    method: 'GET',
  });
};

export const getOrderById = async (id) => {
  return authFetch(`customer/orders/${id}`, {
    method: 'GET',
  });
};
