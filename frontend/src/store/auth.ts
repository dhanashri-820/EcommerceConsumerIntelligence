import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, User } from '../lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string; remember_me?: boolean }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<User | null>;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.login(credentials);
          set({ user: res.user, isLoading: false, isInitialized: true, error: null });
        } catch (err: any) {
          const message = err.response?.data?.detail || err.message || 'Failed to sign in. Please verify your credentials.';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.register(payload);
          set({ user: res.user, isLoading: false, isInitialized: true, error: null });
        } catch (err: any) {
          const message = err.response?.data?.detail || err.message || 'Failed to register account.';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.logout();
        } catch (err) {
          console.error('Logout error:', err);
        } finally {
          set({ user: null, isLoading: false, isInitialized: true, error: null });
        }
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const user = await api.fetchMe();
          set({ user, isLoading: false, isInitialized: true, error: null });
          return user;
        } catch (err: any) {
          set({ user: null, isLoading: false, isInitialized: true });
          return null;
        }
      },
    }),
    {
      name: 'consumer-iq-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
