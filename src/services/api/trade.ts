import api from './api';

export const tradeAPI = {
  // --- Sales ---
  getSalesActivityLogs: (params?: Record<string, unknown>) => api.get('/trade/sales/activity', { params }),
  getQuotes: (params?: Record<string, unknown>) => api.get('/trade/sales/quote', { params }),
  getQuoteById: (id: string | number) => api.get(`/trade/sales/quote/${id}`),
  createQuote: (data: Record<string, unknown>) => api.post('/trade/sales/quote', data),
  acceptQuote: (id: string | number, target: 'ORDER' | 'INVOICE') => api.post(`/trade/sales/quote/${id}/accept?target=${target}`),

  getOrders: (params?: Record<string, unknown>) => api.get('/trade/sales/order', { params }),
  getOrderById: (id: string | number) => api.get(`/trade/sales/order/${id}`),
  createOrder: (data: Record<string, unknown>) => api.post('/trade/sales/order', data),

  getInvoices: (params?: Record<string, unknown>) => api.get('/invoice', { params }),
  getInvoiceById: (id: string | number) => api.get(`/invoice/${id}`),
  createInvoice: (data: Record<string, unknown>) => api.post('/invoice', data),
  sendInvoiceEmail: (id: string | number) => api.post(`/invoice/${id}/send`),

  submitLhdnInvoice: (id: string | number) => api.post(`/lhdn/submit/${id}`),
  getLhdnInvoiceStatus: (id: string | number) => api.get(`/lhdn/status/${id}`),

  createDelivery: (data: Record<string, unknown>) => api.post('/trade/sales/delivery', data),

  // --- Purchase ---
  createPurchaseRequisition: (data: Record<string, unknown>) => api.post('/trade/purchase/requisition', data),
  getPurchaseRequisitions: (params?: Record<string, unknown>) => api.get('/trade/purchase/requisition', { params }),
  createPurchaseOrder: (data: Record<string, unknown>) => api.post('/trade/purchase/order', data),
  getPurchaseOrders: (params?: Record<string, unknown>) => api.get('/trade/purchase/order', { params }),
  createBill: (data: Record<string, unknown>) => api.post('/bill', data),
  getBills: (params?: Record<string, unknown>) => api.get('/bill', { params }),
  
  createGRN: (data: Record<string, unknown>) => api.post('/trade/purchase/grn', data),
  getGRNs: (params?: Record<string, unknown>) => api.get('/trade/purchase/grn', { params }),

  // --- Inventory ---
  getWarehouses: (params?: Record<string, unknown>) => api.get('/trade/inventory/warehouse', { params }),
  getWarehouseById: (id: string | number) => api.get(`/trade/inventory/warehouse/${id}`),
  createWarehouse: (data: Record<string, unknown>) => api.post('/trade/inventory/warehouse', data),

  adjustStock: (data: Record<string, unknown>) => api.post('/trade/inventory/adjust', data),
  getProductMovements: (productId: string | number) => api.get(`/trade/inventory/product/${productId}/movements`),
};
