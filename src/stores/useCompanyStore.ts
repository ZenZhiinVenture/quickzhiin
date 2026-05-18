import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company } from '@/types/company';

// Define the shape of the company state
interface CompanyState {
  companies: Company[];
  currentCompanyId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCompanies: (companies: Company[]) => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  setCurrentCompany: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getCurrentCompany: () => Company | undefined;
  getCompanyById: (id: string) => Company | undefined;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      currentCompanyId: null,
      isLoading: false,
      error: null,

      // Actions
      setCompanies: (companies) => set({ companies }),

      addCompany: (company) =>
        set((state) => ({
          companies: [...state.companies, company],
          currentCompanyId: state.currentCompanyId || company.id,
        })),

      updateCompany: (id, updatedCompany) =>
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === id
              ? {
                  ...company,
                  ...updatedCompany,
                  updatedAt: new Date().toISOString(),
                }
              : company
          ),
        })),

      deleteCompany: (id) =>
        set((state) => {
          const newCompanies = state.companies.filter(
            (company) => company.id !== id
          );
          const newCurrentCompanyId =
            state.currentCompanyId === id
              ? newCompanies.length > 0
                ? newCompanies[0].id
                : null
              : state.currentCompanyId;

          return {
            companies: newCompanies,
            currentCompanyId: newCurrentCompanyId,
          };
        }),

      setCurrentCompany: (id) => set({ currentCompanyId: id }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      // Selectors
      getCurrentCompany: () => {
        const state = get();
        return state.companies.find(
          (company) => company.id === state.currentCompanyId
        );
      },

      getCompanyById: (id) => {
        return get().companies.find((company) => company.id === id);
      },
    }),
    {
      name: 'company-storage',
      partialize: (state) => ({
        companies: state.companies,
        currentCompanyId: state.currentCompanyId,
      }),
    }
  )
);
