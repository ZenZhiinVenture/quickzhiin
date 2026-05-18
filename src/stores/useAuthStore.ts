import { create } from 'zustand';
import AuthState from '@/types/stores/authState';

type AuthStateWithoutActions = Omit<
  AuthState,
  'setUser' | 'setToken' | 'logout' | 'setLoading' | 'setError'
>;

const initialState: AuthStateWithoutActions = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
