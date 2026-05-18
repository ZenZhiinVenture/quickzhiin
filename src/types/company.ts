import { CountryState } from './country';

export interface Company {
  id: string;
  name: string;
  registrationNumber?: string;
  taxId?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: CountryState;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  logo?: string;
  currency?: string;
  fiscalYearStart?: string; // ISO date string (MM-DD)
  createdAt: string;
  updatedAt: string;
}
