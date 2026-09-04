import { apiClient } from './client';

export const getNotifications = async () => {
  const response = await apiClient.get('/api/v1/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await apiClient.post(`/api/v1/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.post('/api/v1/notifications/read-all');
  return response.data;
};
