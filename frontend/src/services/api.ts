import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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