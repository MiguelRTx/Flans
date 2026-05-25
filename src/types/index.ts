export interface User {
  id: number;
  username: string;
  email: string;
  role: 'creator' | 'follower';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Goal {
  id: number;
  creator_id: number;
  title: string;
  description: string;
}

export interface CreatorProfileData {
  id: number;
  user_id: number;
  username?: string;
  display_name: string | null;
  bio: string | null;
  profile_photo: string | null;
  banner: string | null;
  total_flanes: number;
}

export interface PostComment {
  id: number;
  post_id: number;
  follower_id: number;
  follower_username?: string;
  text: string;
  created_at?: string;
}

export interface Post {
  id: number;
  creator_id: number;
  text: string | null;
  image: string | null;
  comments?: PostComment[];
  created_at?: string;
}

export interface FeedPost extends Post {
 creator_display_name: string;
  creator_photo: string | null;
}

export interface Donation {
  id: number;
  flanes: number;
  support_type?: string;
  donated_at: string;
  creator_id: number;
  creator_username?: string;
  creator_display_name?: string;
  follower_id?: number;
  follower_username?: string;
  follower_name?: string;
}

export interface DonationSummary {
  total_flanes: number;
  total_value: number;
  flan_value: number;
  currency: string;
}

export interface IncomeReport {
  start_date: string | null;
  end_date: string | null;
  total_flanes: number;
  total_value: number;
  flan_value: number;
  currency: string;
  donations: Donation[];
}

export interface CreatorListItem {
  id: number;
  user_id: number;
  display_name: string | null;
  username?: string;
  bio: string | null;
  profile_photo: string | null;
  banner: string | null;
}
export interface ImageModalProps {
  src: string;
  onClose: () => void;
}