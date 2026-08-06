import { authFetch } from './api';

export const createOrder = async (orderData) => {
  return authFetch('orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
};

export const getMyOrders = async () => {
  return authFetch('orders/my', {
    method: 'GET',
  });
};

export const getOrderById = async (id) => {
  return authFetch(`orders/${id}`, {
    method: 'GET',
  });
};
