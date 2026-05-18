import api from './api';

export const invoiceAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/invoice', { params }),
  getById: (id: string | number) => api.get(`/invoice/${id}`),
  create: (data: Record<string, unknown>) => api.post('/invoice', data),
  update: (id: string | number, data: Record<string, unknown>) => api.put(`/invoice/${id}`, data),
  delete: (id: string | number) => api.delete(`/invoice/${id}`),
  downloadPdf: (id: string) => api.get(`/invoice/${id}/pdf`, { responseType: 'blob' }),
};
