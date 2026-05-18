import api from './api';

export const contactsAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/contact', { params }),
  getById: (id: string | number) => api.get(`/contact/${id}`),
  create: (data: Record<string, unknown>) => api.post('/contact', data),
  update: (id: string | number, data: Record<string, unknown>) => api.put(`/contact/${id}`, data),
  patchStatus: (id: string | number, isActive: boolean) => api.patch(`/contact/${id}/status`, { isActive }),
  delete: (id: string | number) => api.delete(`/contact/${id}`),
};
