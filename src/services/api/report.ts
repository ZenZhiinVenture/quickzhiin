import api from './api';

export const reportAPI = {
  getProfitAndLoss: (startDate?: string, endDate?: string) => 
    api.get('/report/profit-and-loss', { params: { startDate, endDate } }),
    
  getBalanceSheet: (date?: string) => 
    api.get('/report/balance-sheet', { params: { date } }),
    
  getGeneralLedger: (startDate?: string, endDate?: string) => 
    api.get('/report/general-ledger', { params: { startDate, endDate } }),

  getTrialBalance: (date?: string) => 
    api.get('/report/trial-balance', { params: { date } }),

  getAgedReceivables: () => 
    api.get('/report/aged-receivables'),

  getAgedPayables: () => 
    api.get('/report/aged-payables'),

  getInventorySummary: () =>
    api.get('/report/inventory-summary'),

  getInventoryByLocation: () =>
    api.get('/report/inventory-by-location'),

  getInventoryDetail: (startDate?: string, endDate?: string) =>
    api.get('/report/inventory-detail', { params: { startDate, endDate } }),
};
