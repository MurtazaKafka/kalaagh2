import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  preferred_language: 'en' | 'fa' | 'ps';
  is_email_verified: boolean;
  profile_picture_url?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'student' | 'teacher' | 'parent';
  preferred_language?: 'en' | 'fa' | 'ps';
  grade?: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', data);
          const responseData = response.data;
          
          if (responseData.success) {
            const { token, refreshToken, user } = responseData;
            
            // Set token in API service
            api.setAuthToken(token);
            
            set({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(responseData.error || 'Login failed');
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', data);
          const responseData = response.data;
          
          if (responseData.success) {
            const { token, refreshToken, user } = responseData;
            
            // Set token in API service
            api.setAuthToken(token);
            
            set({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(responseData.error || 'Registration failed');
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Clear token from API service
        api.setAuthToken(null);
        
        // Clear auth state
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Call logout endpoint (optional, for server-side cleanup)
        api.post('/auth/logout', {}).catch(() => {
          // Ignore errors on logout
        });
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const responseData = response.data;
          
          if (responseData.success) {
            const { token, refreshToken: newRefreshToken } = responseData;
            
            // Set new token in API service
            api.setAuthToken(token);
            
            set({
              token,
              refreshToken: newRefreshToken,
            });
          } else {
            get().logout();
          }
        } catch (error) {
          get().logout();
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/users/profile');
          const responseData = response.data;
          
          if (responseData.success) {
            set({
              user: responseData.user,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(responseData.error || 'Failed to fetch profile');
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch profile',
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, set the token in API service
        if (state?.token) {
          api.setAuthToken(state.token);
        }
      },
    }
  )
);