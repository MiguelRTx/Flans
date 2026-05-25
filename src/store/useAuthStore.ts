import { create } from 'zustand';
import type { User } from '../types';


interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('onlyflans_token'),
  isAuthenticated: !!localStorage.getItem('onlyflans_token'),

  setAuth: (user, token) => {
    localStorage.setItem('onlyflans_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('onlyflans_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem('onlyflans_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false });
    }
  }
}));

window.addEventListener('auth:unauthorized', () => {
  useAuthStore.getState().logout();
  window.location.href = '/login';
});