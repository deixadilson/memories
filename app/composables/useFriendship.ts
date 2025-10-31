import type { Friendship, FriendshipStatus } from '~/types/app';

export const useFriendship = () => {
  const getFriendshipStatus = (
    loggedInUserId: string,
    allRelationships: Friendship[],
    otherUserId: string
  ): FriendshipStatus => {
    const iFollowThem = allRelationships.find(f => f.requester_id === loggedInUserId && f.receiver_id === otherUserId);
    const theyFollowMe = allRelationships.find(f => f.requester_id === otherUserId && f.receiver_id === loggedInUserId);

    if (iFollowThem?.status === 'blocked') return 'blocked';
    if (theyFollowMe?.status === 'blocked') return 'not_friends';

    if (iFollowThem?.status === 'pending') return 'request_sent';
    if (theyFollowMe?.status === 'pending') return 'request_received';

    const isFollowing = iFollowThem?.status === 'accepted';
    const isFollower = theyFollowMe?.status === 'accepted';

    if (isFollowing && isFollower) return 'mutual';
    if (isFollowing) return 'following';
    if (isFollower) return 'follower_only';

    
    return 'not_friends';
  };

  return {
    getFriendshipStatus,
  };
};
