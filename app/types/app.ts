import type { Database } from './supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Period = Database['public']['Tables']['periods']['Row'];
export type Memory = Database['public']['Tables']['memories']['Row'];
export type Friendship = Database['public']['Tables']['friendships']['Row'];
export type Like = Database['public']['Tables']['likes']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type MemoryInsert = Database['public']['Tables']['memories']['Insert'];
export type PeriodInsert = Database['public']['Tables']['periods']['Insert'];
export type DatePrecision = Database['public']['Enums']['date_precision'];
export type MemoryCategory = Database['public']['Enums']['memory_category'];
export type PeriodType = Database['public']['Enums']['period_type'];
export type VisibilityType = Database['public']['Enums']['visibility_type']
export type FriendshipStatus = 'not_friends' | 'following' | 'follower_only' | 'mutual' | 'request_sent' | 'request_received' | 'blocked';

export type CommentWithProfile = Comment & {
  profiles: Profile | null;
};
export type MemoryWithAuthor = Memory & {
  profiles: Profile | Profile[] | null;
};
export type UserModalState = SelectedMemory & {
  isOpen: boolean;
  currentIndex: number;
  liking: boolean;
  list: MemoryWithAuthor[];
};

export interface UserWithStatus extends Profile { status: FriendshipStatus; }
export interface MemoryFormData {
  title: string;
  category: MemoryCategory;
  location: string;
  description: string;
  visibility: VisibilityType;
}
export interface PeriodFormData {
  title: string;
  type: PeriodType;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  visibility: VisibilityType;
}
export interface SelectedMemory {
  memory: MemoryWithAuthor | null;
  likes: Like[];
  comments: CommentWithProfile[];
}
