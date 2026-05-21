import { api } from '../../../config/api';
import type { CreatorProfileData, Goal, Post, IncomeReport } from '../../../types';

export const creatorService = {
  // ── Perfil ──────────────────────────────────────────────────────
  updateProfile: async (data: { display_name: string; bio: string }) => {
    const response = await api.put('/creators/profile', data);
    return response.data;
  },

  getById: async (id: number): Promise<{ creator: CreatorProfileData; goals: Goal[] }> => {
    const response = await api.get(`/creators/${id}`);
    return response.data;
  },

  // CORRECCIÓN: Sobrescribir header para Multipart
  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/creators/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // CORRECCIÓN: Sobrescribir header para Multipart
  uploadBanner: async (file: File) => {
    const formData = new FormData();
    formData.append('banner', file);
    const response = await api.post('/creators/profile/banner', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ── Posts ────────────────────────────────────────────────────────
  getMyPosts: async (): Promise<Post[]> => {
    const response = await api.get('/creators/posts/mine');
    return response.data.posts;
  },

  // CORRECCIÓN: Sobrescribir header para Multipart
  createPost: async (text: string, file: File | null) => {
    const formData = new FormData();
    formData.append('text', text);
    if (file) {
      formData.append('image', file);
    }
    const response = await api.post('/creators/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePost: async (id: number) => {
    const response = await api.delete(`/creators/posts/${id}`);
    return response.data;
  },

  // ── Goals (Metas) ──────────────────────────────────────────────
  getMyGoals: async (): Promise<Goal[]> => {
    const response = await api.get('/creators/goals/mine');
    return response.data.goals;
  },

  createGoal: async (data: { title: string; description?: string }): Promise<{ goal: Goal }> => {
    const response = await api.post('/creators/goals', data);
    return response.data;
  },

  updateGoal: async (id: number, data: { title?: string; description?: string }): Promise<{ goal: Goal }> => {
    const response = await api.put(`/creators/goals/${id}`, data);
    return response.data;
  },

  deleteGoal: async (id: number) => {
    const response = await api.delete(`/creators/goals/${id}`);
    return response.data;
  },

  // ── Income Report ──────────────────────────────────────────────
  getIncomeReport: async (filters?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ report: IncomeReport }> => {
    const response = await api.get('/creators/income/report', { params: filters });
    return response.data;
  },
};