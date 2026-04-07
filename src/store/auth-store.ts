import { create } from 'zustand';
import { User } from '@/types/types';
import * as authApi from '@/lib/auth-api';
import * as userApi from '@/lib/user-api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await userApi.getProfile();
      set({ user, isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      await authApi.signin({ email, password });
      await get().fetchUser();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  refresh: async () => {
    try {
      await authApi.refresh();
      await get().fetchUser();
    } catch (error) {
      set({ user: null });
      throw error;
    }
  },
}));