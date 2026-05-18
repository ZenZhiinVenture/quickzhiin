import { countries } from '@/config/countries';
import { CountryState } from '@/types/country';

// Helper function to get country by code
export function getCountryByCode(code: string): CountryState | undefined {
  return countries.find(country => country.code === code);
}

// Helper function to get country by phone code
export function getCountryByPhoneCode(phoneCode: string): CountryState | undefined {
  return countries.find(country => country.phoneCode === phoneCode);
}

// Helper function to get country by name
export function getCountryByName(name: string): CountryState | undefined {
  return countries.find(country => country.name === name);
}

// Helper function to get country by currency code
export function getCountryByCurrencyCode(currencyCode: string): CountryState | undefined {
  return countries.find(country => country.currencyCode === currencyCode);
}
