import api from './api';

export const billAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/bill', { params }),
  getById: (id: string | number) => api.get(`/bill/${id}`),
  create: (data: Record<string, unknown>) => api.post('/bill', data),
  update: (id: string | number, data: Record<string, unknown>) => api.put(`/bill/${id}`, data),
  delete: (id: string | number) => api.delete(`/bill/${id}`),
};
