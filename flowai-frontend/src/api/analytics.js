import { apiClient } from './client';

export const getAnalyticsOverview = async () => {
  const response = await apiClient.get('/api/v1/analytics/overview');
  return response.data;
};

export const getCostBreakdown = async () => {
  const response = await apiClient.get('/api/v1/analytics/costs');
  return response.data;
};
