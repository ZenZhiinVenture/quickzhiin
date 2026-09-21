import api from './api';

export interface SupportedCurrency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRateItem {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number | string;
  effectiveDate: string;
  source?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CurrencySettingsResponse {
  baseCurrency: string;
  supportedCurrencies: SupportedCurrency[];
  rates: ExchangeRateItem[];
}

export const currencyAPI = {
  getSettings: () => api.get<{ status: string; data: CurrencySettingsResponse }>('/currency'),
  setBaseCurrency: (currency: string) =>
    api.post<{ status: string; message: string; data: { baseCurrency: string } }>('/currency/base', {
      currency,
    }),
  createRate: (data: {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    effectiveDate?: string;
    source?: string;
    notes?: string;
  }) => api.post<{ status: string; data: ExchangeRateItem }>('/currency/rates', data),
  deleteRate: (id: string | number) =>
    api.delete<{ status: string; message: string }>(`/currency/rates/${id}`),
};
