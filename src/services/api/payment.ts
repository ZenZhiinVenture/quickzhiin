import api from './api';

export const paymentAPI = {
  recordInvoicePayment: (invoiceId: string | number, data: { amount: number; methodId: string | number; paidAt: string | Date }) => 
    api.post(`/payment/invoice/${invoiceId}`, data),
    
  recordBillPayment: (billId: string | number, data: { amount: number; methodId: string | number; paidAt: string | Date }) => 
    api.post(`/payment/bill/${billId}`, data),
    
  getMethods: () => api.get('/payment/methods'),
};
