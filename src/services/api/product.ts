import api from './api';

export const productAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/inventory/product', { params }),
  getById: (id: string | number) => api.get(`/inventory/product/${id}`),
  create: (data: Record<string, unknown>) => api.post('/inventory/product', data),
  update: (id: string | number, data: Record<string, unknown>) => api.put(`/inventory/product/${id}`, data),
  delete: (id: string | number) => api.delete(`/inventory/product/${id}`),
};
