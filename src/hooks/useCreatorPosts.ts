import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CreatorPost {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  hashtags: string[] | null;
  mentions: string[] | null;
  location: string | null;
  likes_count: number;
  views_count: number;
  comments_count: number;
  delivery_status: string;
  host_approval_status: string;
  created_at: string;
  updated_at: string;
  posting_date: string | null;
  property_id: string | null;
  property_title?: string;
  property_location?: string;
  property_image?: string;
}

export interface PostStats {
  total_posts: number;
  published_posts: number;
  pending_posts: number;
  total_likes: number;
  total_views: number;
  avg_engagement: number;
}

interface Filters {
  approval_status?: string;
  delivery_status?: string;
  search?: string;
}

export const useCreatorPosts = (influencerId: string) => {
  const [posts, setPosts] = useState<CreatorPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<CreatorPost[]>([]);
  const [stats, setStats] = useState<PostStats>({
    total_posts: 0,
    published_posts: 0,
    pending_posts: 0,
    total_likes: 0,
    total_views: 0,
    avg_engagement: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("content_posts")
        .select(
          `
          *,
          properties (
            id,
            title,
            location,
            property_images (
              image_url,
              is_primary
            )
          )
        `,
        )
        .eq("influencer_id", influencerId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const transformedPosts: CreatorPost[] =
        data?.map((post) => ({
          ...post,
          media_type: post.media_type as "image" | "video",
          property_title: post.properties?.title,
          property_location: post.properties?.location,
          property_image: post.properties?.property_images?.find(
            (img: any) => img.is_primary,
          )?.image_url,
        })) || [];

      setPosts(transformedPosts);
      setFilteredPosts(transformedPosts);
      calculateStats(transformedPosts);
    } catch (error: any) {
      // Set empty state instead of crashing
      setPosts([]);
      setFilteredPosts([]);
      setStats({
        total_posts: 0,
        published_posts: 0,
        pending_posts: 0,
        total_likes: 0,
        total_views: 0,
        avg_engagement: 0,
      });

      toast({
        title: "Error",
        description: "Failed to fetch posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (postsData: CreatorPost[]) => {
    const totalPosts = postsData.length;
    const publishedPosts = postsData.filter(
      (p) => p.delivery_status === "published",
    ).length;
    const pendingPosts = postsData.filter(
      (p) => p.host_approval_status === "pending",
    ).length;
    const totalLikes = postsData.reduce(
      (sum, p) => sum + (p.likes_count || 0),
      0,
    );
    const totalViews = postsData.reduce(
      (sum, p) => sum + (p.views_count || 0),
      0,
    );
    const avgEngagement = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

    setStats({
      total_posts: totalPosts,
      published_posts: publishedPosts,
      pending_posts: pendingPosts,
      total_likes: totalLikes,
      total_views: totalViews,
      avg_engagement: Number(avgEngagement.toFixed(2)),
    });
  };

  const applyFilters = (filters: Filters, sortBy: string = "newest") => {
    let filtered = [...posts];

    if (filters.approval_status && filters.approval_status !== "all") {
      filtered = filtered.filter(
        (p) => p.host_approval_status === filters.approval_status,
      );
    }

    if (filters.delivery_status && filters.delivery_status !== "all") {
      filtered = filtered.filter(
        (p) => p.delivery_status === filters.delivery_status,
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.caption?.toLowerCase().includes(searchLower) ||
          p.hashtags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          p.property_title?.toLowerCase().includes(searchLower),
      );
    }

    // Sort
    switch (sortBy) {
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        break;
      case "most_likes":
        filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case "most_views":
        filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }

    setFilteredPosts(filtered);
  };

  const updatePost = async (postId: string, updates: Partial<CreatorPost>) => {
    try {
      const { error } = await supabase
        .from("content_posts")
        .update(updates)
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post updated successfully",
      });

      await fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("content_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });

      await fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (influencerId) {
      fetchPosts();
    }
  }, [influencerId]);

  return {
    posts: filteredPosts,
    allPosts: posts,
    stats,
    loading,
    applyFilters,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
};
