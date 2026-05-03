import { create } from 'zustand';
import { User } from '@/types/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setLoggingIn: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isLoggingIn: false,
  
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLoggingIn: (loading) => set({ isLoggingIn: loading }),
  reset: () => set({ user: null, isLoading: false, isLoggingIn: false }),
}));