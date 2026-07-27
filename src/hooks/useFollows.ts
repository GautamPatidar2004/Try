import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFollows = (userId?: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if current user follows the target user
  const checkFollowStatus = async (targetUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === targetUserId) return;

      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  // Get follower count for a user
  const fetchFollowerCount = async (targetUserId: string) => {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId);

      if (error) throw error;
      setFollowerCount(count || 0);
    } catch (error) {
      console.error('Error fetching follower count:', error);
    }
  };

  // Get following count for a user
  const fetchFollowingCount = async (targetUserId: string) => {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetUserId);

      if (error) throw error;
      setFollowingCount(count || 0);
    } catch (error) {
      console.error('Error fetching following count:', error);
    }
  };

  // Follow a user
  const followUser = async (targetUserId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to follow users",
          variant: "destructive",
        });
        return;
      }

      if (user.id === targetUserId) {
        toast({
          title: "Invalid action",
          description: "You cannot follow yourself",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

      if (error) throw error;

      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);

      // Create notification for the followed user
      await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type: 'new_follower',
          title: 'New Follower',
          message: 'Someone started following you',
          related_id: user.id,
        });

      toast({
        title: "Success",
        description: "You are now following this user",
      });
    } catch (error: any) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to follow user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Unfollow a user
  const unfollowUser = async (targetUserId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;

      setIsFollowing(false);
      setFollowerCount(prev => Math.max(0, prev - 1));

      toast({
        title: "Success",
        description: "You unfollowed this user",
      });
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unfollow user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle follow status
  const toggleFollow = async (targetUserId: string) => {
    if (isFollowing) {
      await unfollowUser(targetUserId);
    } else {
      await followUser(targetUserId);
    }
  };

  // Initialize data for a specific user
  useEffect(() => {
    if (userId) {
      checkFollowStatus(userId);
      fetchFollowerCount(userId);
      fetchFollowingCount(userId);
    }
  }, [userId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`follows-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_follows',
          filter: `following_id=eq.${userId}`,
        },
        () => {
          fetchFollowerCount(userId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_follows',
          filter: `follower_id=eq.${userId}`,
        },
        () => {
          fetchFollowingCount(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    isFollowing,
    followerCount,
    followingCount,
    loading,
    toggleFollow,
    checkFollowStatus,
    fetchFollowerCount,
    fetchFollowingCount,
  };
};
