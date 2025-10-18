import type { Database } from './supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Friendship = Database['public']['Tables']['friendships']['Row'];
export type MemoryInsert = Database['public']['Tables']['memories']['Insert'];
export type PeriodInsert = Database['public']['Tables']['periods']['Insert'];
export type DatePrecision = Database['public']['Enums']['date_precision'];
export type FriendshipStatus = 'not_friends' | 'following' | 'follower_only' | 'mutual' | 'request_sent' | 'request_received';
export interface UserWithStatus extends Profile { status: FriendshipStatus; }
