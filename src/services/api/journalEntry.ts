import api from './api';

export const journalEntryAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/journal-entry', { params }),
  getById: (id: string | number) => api.get(`/journal-entry/${id}`),
  create: (data: Record<string, unknown>) => api.post('/journal-entry', data),
  importCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/journal-entry/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
