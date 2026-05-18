import { User } from '@/types/user';
import api from './api';

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (userData: User) => api.post('/auth/register', userData),

  verifyToken: () => api.get('/auth/verify'),
};
