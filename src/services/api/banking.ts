import api from './api';

export const bankingAPI = {
  // Income
  getIncomes: (params?: Record<string, unknown>) => api.get('/banking/income', { params }),
  getIncomeById: (id: string | number) => api.get(`/banking/income/${id}`),
  createIncome: (data: Record<string, unknown>) => api.post('/banking/income', data),
  updateIncome: (id: string | number, data: Record<string, unknown>) => api.put(`/banking/income/${id}`, data),
  patchIncomeStatus: (id: string | number, status: string) => api.patch(`/banking/income/${id}/status`, { status }),
  deleteIncome: (id: string | number) => api.delete(`/banking/income/${id}`),

  // Expense
  getExpenses: (params?: Record<string, unknown>) => api.get('/banking/expense', { params }),
  getExpenseById: (id: string | number) => api.get(`/banking/expense/${id}`),
  createExpense: (data: Record<string, unknown>) => api.post('/banking/expense', data),
  updateExpense: (id: string | number, data: Record<string, unknown>) => api.put(`/banking/expense/${id}`, data),
  patchExpenseStatus: (id: string | number, status: string) => api.patch(`/banking/expense/${id}/status`, { status }),
  deleteExpense: (id: string | number) => api.delete(`/banking/expense/${id}`),

  // Transfer
  getTransfers: (params?: Record<string, unknown>) => api.get('/banking/transfer', { params }),
  getTransferById: (id: string | number) => api.get(`/banking/transfer/${id}`),
  createTransfer: (data: Record<string, unknown>) => api.post('/banking/transfer', data),
  updateTransfer: (id: string | number, data: Record<string, unknown>) => api.put(`/banking/transfer/${id}`, data),
  deleteTransfer: (id: string | number) => api.delete(`/banking/transfer/${id}`),
};
