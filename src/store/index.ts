import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AppState {
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        theme: 'system',
        isLoading: false,
        setUser: (user) => set({ user }),
        setTheme: (theme) => set({ theme }),
        setLoading: (isLoading) => set({ isLoading }),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({ theme: state.theme }),
      }
    )
  )
);
