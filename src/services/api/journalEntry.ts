import api from './api';

export const journalEntryAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/transaction/journal-entry', { params }),
  getById: (id: string | number) => api.get(`/transaction/journal-entry/${id}`),
  create: (data: Record<string, unknown>) => api.post('/transaction/journal-entry', data),
};
