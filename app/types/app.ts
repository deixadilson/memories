import type { Database } from './supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Friendship = Database['public']['Tables']['friendships']['Row'];
export type FriendshipStatus = 'not_friends' | 'following' | 'follower_only' | 'mutual' | 'request_sent' | 'request_received';
export interface UserWithStatus extends Profile { status: FriendshipStatus; }
