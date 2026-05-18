import api from './api';

export const userAPI = {
  getAll: () => api.get('/user'),
  create: (data: any) => api.post('/user', data),
  update: (id: string, data: any) => api.put(`/user/${id}`, data),
  delete: (id: string) => api.delete(`/user/${id}`),
};

export const roleAPI = {
  getAll: () => api.get('/role'),
  getById: (id: string) => api.get(`/role/${id}`),
  create: (data: any) => api.post('/role', data),
  update: (id: string, data: any) => api.put(`/role/${id}`, data),
  delete: (id: string) => api.delete(`/role/${id}`),
};
