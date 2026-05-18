import BaseState from './baseState';
import { User } from '@/types/user';

export default interface AuthState extends BaseState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}
