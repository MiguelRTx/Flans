import { api } from '../../../config/api';
import type {
  CreatorProfileData,
  CreatorListItem,
  Goal,
  Post,
  FeedPost,
  Donation,
  DonationSummary,
} from '../../../types';

export const followerService = {
  searchCreators: async (query: string): Promise<{ creators: CreatorListItem[]; count: number }> => {
    const response = await api.get('/followers/search', { params: { q: query } });
    return response.data;
  },

  getAllCreators: async (): Promise<{ creators: CreatorListItem[] }> => {
    const response = await api.get('/creators');
    return response.data;
  },

  getCreatorProfile: async (
    id: number
  ): Promise<{ creator: CreatorProfileData; goals: Goal[] }> => {
    const response = await api.get(`/followers/creators/${id}`);
    return response.data;
  },

  getCreatorPosts: async (creatorId: number): Promise<Post[]> => {
    const response = await api.get(`/followers/creators/${creatorId}/posts`);
    return response.data.posts;
  },


  donate: async (
    creator_id: number,
    flanes: number
  ): Promise<{ message: string; donation: Donation; total_value: number }> => {
    const response = await api.post('/followers/donate', { creator_id, flanes });
    return response.data;
  },

  getDonationHistory: async (filters?: {
    start_date?: string;
    end_date?: string;
    creator_name?: string;
  }): Promise<{ donations: Donation[]; summary: DonationSummary }> => {
    const response = await api.get('/followers/donations', { params: filters });
    return response.data;
  },

  createComment: async (post_id: number, text: string) => {
    const response = await api.post('/followers/comments', { post_id, text });
    return response.data;
  },


  getFavorites: async (): Promise<{ favorites: CreatorListItem[] }> => {
    const response = await api.get('/followers/favorites');
    return response.data;
  },

  addFavorite: async (creatorId: number) => {
    const response = await api.post(`/followers/favorites/${creatorId}`);
    return response.data;
  },

  removeFavorite: async (creatorId: number) => {
    const response = await api.delete(`/followers/favorites/${creatorId}`);
    return response.data;
  },

  // ── Feed ───────────────────────────────────────────────────────
  getFeed: async (): Promise<{ feed: FeedPost[]; count: number }> => {
    const response = await api.get('/followers/feed');
    return response.data;
  },
};
