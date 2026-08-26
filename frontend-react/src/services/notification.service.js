import { apiGet, apiPatch } from './api';

export const getCustomerNotifications = async () => {
  return apiGet('customer/notifications');
};

export const markNotificationAsRead = async (id) => {
  return apiPatch(`customer/notifications/${id}/read`);
};
