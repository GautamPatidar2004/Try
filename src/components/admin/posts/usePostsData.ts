
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContentPost {
  id: string;
  media_type: string;
  media_url: string;
  caption: string;
  hashtags: string[] | null;
  mentions: string[] | null;
  location: string | null;
  likes_count: number;
  views_count: number;
  host_approval_status: string;
  delivery_status: string;
  created_at: string;
  posting_date: string | null;
  influencer_id: string;
  influencers: {
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

export const usePostsData = () => {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          influencers (
            profiles (
              first_name,
              last_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = data as unknown as ContentPost[];
      setPosts(typedData || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApprovalStatus = async (postId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('content_posts')
        .update({ host_approval_status: newStatus })
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, host_approval_status: newStatus }
          : post
      ));

      toast({
        title: "Success",
        description: `Post ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Error updating post status:', error);
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive",
      });
    }
  };

  const bulkUpdateStatus = async (postIds: string[], newStatus: string) => {
    try {
      const { error } = await supabase
        .from('content_posts')
        .update({ host_approval_status: newStatus })
        .in('id', postIds);

      if (error) throw error;

      setPosts(posts.map(post => 
        postIds.includes(post.id)
          ? { ...post, host_approval_status: newStatus }
          : post
      ));

      toast({
        title: "Success",
        description: `${postIds.length} posts ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Error bulk updating posts:', error);
      toast({
        title: "Error",
        description: "Failed to update posts",
        variant: "destructive",
      });
    }
  };

  const getStats = () => {
    const total = posts.length;
    const pending = posts.filter(p => p.host_approval_status === 'pending').length;
    const approved = posts.filter(p => p.host_approval_status === 'approved').length;
    const totalLikes = posts.reduce((sum, p) => sum + p.likes_count, 0);
    const totalViews = posts.reduce((sum, p) => sum + p.views_count, 0);
    const avgEngagement = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

    return {
      total,
      pending,
      approved,
      totalLikes,
      totalViews,
      avgEngagement: avgEngagement.toFixed(2)
    };
  };

  return {
    posts,
    loading,
    updateApprovalStatus,
    bulkUpdateStatus,
    getStats,
    refetch: fetchPosts
  };
};
