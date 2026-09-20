import api from './api';

export const tradeAPI = {
  // --- Sales ---
  getSalesActivityLogs: (params?: Record<string, unknown>) => api.get('/trade/sales/activity', { params }),
  getQuotes: (params?: Record<string, unknown>) => api.get('/trade/sales/quote', { params }),
  getQuoteById: (id: string | number) => api.get(`/trade/sales/quote/${id}`),
  createQuote: (data: Record<string, unknown>) => api.post('/trade/sales/quote', data),
  updateQuote: (id: string | number, data: Record<string, unknown>) => api.put(`/trade/sales/quote/${id}`, data),
  patchQuoteStatus: (id: string | number, status: string) => api.patch(`/trade/sales/quote/${id}/status`, { status }),
  deleteQuote: (id: string | number) => api.delete(`/trade/sales/quote/${id}`),
  acceptQuote: (id: string | number, target: 'ORDER' | 'INVOICE') => api.post(`/trade/sales/quote/${id}/accept?target=${target}`),

  getOrders: (params?: Record<string, unknown>) => api.get('/trade/sales/order', { params }),
  getOrderById: (id: string | number) => api.get(`/trade/sales/order/${id}`),
  createOrder: (data: Record<string, unknown>) => api.post('/trade/sales/order', data),
  updateOrder: (id: string | number, data: Record<string, unknown>) => api.put(`/trade/sales/order/${id}`, data),
  patchOrderStatus: (id: string | number, status: string) => api.patch(`/trade/sales/order/${id}/status`, { status }),
  deleteOrder: (id: string | number) => api.delete(`/trade/sales/order/${id}`),

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
  updatePurchaseOrder: (id: string | number, data: Record<string, unknown>) => api.put(`/trade/purchase/order/${id}`, data),
  patchPurchaseOrderStatus: (id: string | number, status: string) => api.patch(`/trade/purchase/order/${id}/status`, { status }),
  deletePurchaseOrder: (id: string | number) => api.delete(`/trade/purchase/order/${id}`),

  createBill: (data: Record<string, unknown>) => api.post('/bill', data),
  getBills: (params?: Record<string, unknown>) => api.get('/bill', { params }),

  createGRN: (data: Record<string, unknown>) => api.post('/trade/purchase/grn', data),
  getGRNs: (params?: Record<string, unknown>) => api.get('/trade/purchase/grn', { params }),
  updateGRN: (id: string | number, data: Record<string, unknown>) => api.put(`/trade/purchase/grn/${id}`, data),
  patchGRNStatus: (id: string | number, status: string) => api.patch(`/trade/purchase/grn/${id}/status`, { status }),
  deleteGRN: (id: string | number) => api.delete(`/trade/purchase/grn/${id}`),

  // --- Sales Credit Notes & Refunds ---
  getSalesCreditNotes: (params?: Record<string, unknown>) => api.get('/trade/sales/credit-note', { params }),
  createSalesCreditNote: (data: Record<string, unknown>) => api.post('/trade/sales/credit-note', data),
  deleteSalesCreditNote: (id: string | number) => api.delete(`/trade/sales/credit-note/${id}`),

  getSalesRefunds: (params?: Record<string, unknown>) => api.get('/trade/sales/refund', { params }),
  createSalesRefund: (data: Record<string, unknown>) => api.post('/trade/sales/refund', data),
  deleteSalesRefund: (id: string | number) => api.delete(`/trade/sales/refund/${id}`),

  // --- Purchase Credit Notes & Refunds ---
  getPurchaseCreditNotes: (params?: Record<string, unknown>) => api.get('/trade/purchase/credit-note', { params }),
  createPurchaseCreditNote: (data: Record<string, unknown>) => api.post('/trade/purchase/credit-note', data),
  deletePurchaseCreditNote: (id: string | number) => api.delete(`/trade/purchase/credit-note/${id}`),

  getPurchaseRefunds: (params?: Record<string, unknown>) => api.get('/trade/purchase/refund', { params }),
  createPurchaseRefund: (data: Record<string, unknown>) => api.post('/trade/purchase/refund', data),
  deletePurchaseRefund: (id: string | number) => api.delete(`/trade/purchase/refund/${id}`),

  // --- Inventory ---
  getWarehouses: (params?: Record<string, unknown>) => api.get('/trade/inventory/warehouse', { params }),
  getWarehouseById: (id: string | number) => api.get(`/trade/inventory/warehouse/${id}`),
  createWarehouse: (data: Record<string, unknown>) => api.post('/trade/inventory/warehouse', data),

  adjustStock: (data: Record<string, unknown>) => api.post('/trade/inventory/adjust', data),
  getProductMovements: (productId: string | number) => api.get(`/trade/inventory/product/${productId}/movements`),
};
