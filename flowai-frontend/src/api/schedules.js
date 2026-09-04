import { apiClient } from './client';

export const getSchedules = async (workflowId = null) => {
  const params = workflowId ? { workflow_id: workflowId } : {};
  const response = await apiClient.get('/api/v1/schedules', { params });
  return response.data;
};

export const createSchedule = async (scheduleData) => {
  const response = await apiClient.post('/api/v1/schedules', scheduleData);
  return response.data;
};

export const updateSchedule = async (id, updates) => {
  const response = await apiClient.put(`/api/v1/schedules/${id}`, updates);
  return response.data;
};

export const deleteSchedule = async (id) => {
  await apiClient.delete(`/api/v1/schedules/${id}`);
};
