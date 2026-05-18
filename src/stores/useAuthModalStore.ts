'use client';

import { create } from 'zustand';

export type AuthModalView = 'login' | 'register' | 'forgotpassword';

interface AuthModalState {
  isOpen: boolean;
  view: AuthModalView;
  openModal: (view: AuthModalView) => void;
  closeModal: () => void;
}

const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  view: 'login',
  openModal: (view: AuthModalView) => set({ isOpen: true, view }),
  closeModal: () => set({ isOpen: false }),
}));

export default useAuthModalStore;
