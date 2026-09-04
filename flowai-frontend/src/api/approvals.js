import { apiClient } from './client';

export const getApprovals = async (status = null) => {
  const params = status ? { status } : {};
  const response = await apiClient.get('/api/v1/approvals', { params });
  return response.data;
};

export const getApprovalById = async (id) => {
  const response = await apiClient.get(`/api/v1/approvals/${id}`);
  return response.data;
};

export const approveAction = async (id, comment = '') => {
  const response = await apiClient.post(`/api/v1/approvals/${id}/approve`, null, {
    params: comment ? { comment } : {},
  });
  return response.data;
};

export const rejectAction = async (id, comment = '') => {
  const response = await apiClient.post(`/api/v1/approvals/${id}/reject`, null, {
    params: comment ? { comment } : {},
  });
  return response.data;
};

export const editApprovalAction = async (id, newPayload, comment = '') => {
  const response = await apiClient.post(`/api/v1/approvals/${id}/action`, {
    action: 'edit',
    payload: newPayload,
    comment,
  });
  return response.data;
};
