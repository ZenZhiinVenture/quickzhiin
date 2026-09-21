import api from './api';

export interface AccountingPeriodItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED';
  closedAt?: string | null;
  closedBy?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const accountingPeriodAPI = {
  getAll: () => api.get<{ status: string; data: AccountingPeriodItem[] }>('/accounting-period'),
  create: (data: { name: string; startDate: string; endDate: string; notes?: string }) =>
    api.post<{ status: string; data: AccountingPeriodItem }>('/accounting-period', data),
  close: (id: string | number) =>
    api.patch<{ status: string; data: AccountingPeriodItem }>(`/accounting-period/${id}/close`),
  reopen: (id: string | number) =>
    api.patch<{ status: string; data: AccountingPeriodItem }>(`/accounting-period/${id}/reopen`),
  delete: (id: string | number) =>
    api.delete<{ status: string; message: string }>(`/accounting-period/${id}`),
};
