import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import BaseState from '@/types/stores/baseState';

// Create the base store with middleware
export const createBaseStore = <T extends BaseState>(
  name: string,
  initialState: Omit<T, keyof BaseState>
) =>
  create<T>()(
    devtools(
      persist(
        (set) =>
          ({
            ...initialState,
            isLoading: false,
            error: null,
            setLoading: (loading: boolean) =>
              set((state) => ({ ...state, isLoading: loading })),
            setError: (error: string | null) =>
              set((state) => ({ ...state, error })),
          }) as T,
        {
          name,
          storage: createJSONStorage(() => localStorage),
        }
      )
    )
  );
