import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface ExtendedAxiosInstance extends AxiosInstance {
  setAuthToken: (token: string | null) => void;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}) as ExtendedAxiosInstance;

// Add auth token to requests
api.setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const authStore = (await import('../stores/authStore')).useAuthStore.getState();
      
      if (authStore.refreshToken) {
        try {
          await authStore.refreshAccessToken();
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          authStore.logout();
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Content Management API
export const contentApi = {
  getSources: async () => {
    const response = await api.get('/content-management/sources');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/content-management/stats');
    return response.data;
  },

  getItems: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
    gradeLevel?: string;
  }) => {
    const response = await api.get('/content-management/items', { params });
    return response.data;
  },

  startKhanAcademyImport: async (subjectSlug: string, subjectId: string) => {
    const response = await api.post('/content-management/khan-academy/import', {
      subjectSlug,
      subjectId,
    });
    return response.data;
  },

  getImportProgress: async (progressId: string) => {
    const response = await api.get(`/content-management/khan-academy/import/${progressId}`);
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await axios.get('http://localhost:3001/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend not available');
  }
};