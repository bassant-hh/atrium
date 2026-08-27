import { apiDelete, apiGet, apiPatch } from './api';

export const getCustomerNotifications = async () => {
  return apiGet('customer/notifications');
};

export const markNotificationAsRead = async (id) => {
  return apiPatch(`customer/notifications/${id}/read`);
};

export const clearAllNotifications = async () => {
  return apiDelete('customer/notifications');
};
