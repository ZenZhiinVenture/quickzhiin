import api from './api';

export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'BIANNUALLY' | 'ANNUALLY';
export type RecurringStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface RecurringInvoiceLineItem {
  productId?: string | number;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  classificationCode?: string;
  msicCode?: string;
  msicDescription?: string;
}

export interface RecurringInvoiceProfile {
  id: string;
  profileName: string;
  contactId: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string | null;
  nextRunDate: string;
  lastRunDate?: string | null;
  currency: string;
  exchangeRate: number | string;
  status: RecurringStatus;
  autoSendEmail: boolean;
  lineItems: RecurringInvoiceLineItem[];
  notes?: string | null;
  paymentTerms?: string | null;
  invoicesGenerated: number;
  maxOccurrences?: number | null;
  contact?: {
    id: string;
    legalname: string;
    taxNo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringInvoiceInput {
  profileName: string;
  contactId: string | number;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  currency?: string;
  exchangeRate?: number;
  autoSendEmail?: boolean;
  lineItems: RecurringInvoiceLineItem[];
  notes?: string;
  paymentTerms?: string;
  maxOccurrences?: number;
}

export interface ProcessBatchResult {
  processedCount: number;
  completedCount: number;
  invoicesGenerated: Array<{
    recurringProfileId: string;
    profileName: string;
    invoiceId: string;
    invoiceNumber: string;
    date: string;
  }>;
  errors: Array<{
    recurringProfileId: string;
    profileName: string;
    error: string;
  }>;
}

export const recurringInvoiceAPI = {
  list: (params?: { status?: string; search?: string }) =>
    api.get<{ status: string; data: RecurringInvoiceProfile[] }>('/recurring-invoice', { params }),

  getById: (id: string | number) =>
    api.get<{ status: string; data: RecurringInvoiceProfile }>(`/recurring-invoice/${id}`),

  create: (data: CreateRecurringInvoiceInput) =>
    api.post<{ status: string; data: RecurringInvoiceProfile }>('/recurring-invoice', data),

  update: (id: string | number, data: Partial<CreateRecurringInvoiceInput> & { status?: RecurringStatus; nextRunDate?: string }) =>
    api.put<{ status: string; data: RecurringInvoiceProfile }>(`/recurring-invoice/${id}`, data),

  delete: (id: string | number) =>
    api.delete<{ status: string; message: string }>(`/recurring-invoice/${id}`),

  pause: (id: string | number) =>
    api.patch<{ status: string; data: RecurringInvoiceProfile }>(`/recurring-invoice/${id}/pause`),

  resume: (id: string | number) =>
    api.patch<{ status: string; data: RecurringInvoiceProfile }>(`/recurring-invoice/${id}/resume`),

  processBatch: (targetDate?: string) =>
    api.post<{ status: string; data: ProcessBatchResult }>('/recurring-invoice/process', { targetDate }),
};
