import api from './api';

export const accountAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/account', { params }),
  getById: (id: string | number) => api.get(`/account/${id}`),
  create: (data: Record<string, unknown>) => api.post('/account', data),
  update: (id: string | number, data: Record<string, unknown>) => api.put(`/account/${id}`, data),
  delete: (id: string | number) => api.delete(`/account/${id}`),
  getLedgerReport: (params?: Record<string, unknown>) => api.get('/account/report/ledger', { params }),
  getProfitLossReport: (params?: Record<string, unknown>) => api.get('/account/report/profit-loss', { params }),
  getBalanceSheetReport: (params?: Record<string, unknown>) => api.get('/account/report/balance-sheet', { params }),
};
