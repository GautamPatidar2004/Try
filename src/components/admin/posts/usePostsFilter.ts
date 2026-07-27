
import { useState, useMemo } from "react";

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

export const usePostsFilter = (posts: ContentPost[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${post.influencers?.profiles?.first_name} ${post.influencers?.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterStatus === "all" || 
        post.host_approval_status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [posts, searchTerm, filterStatus]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredPosts
  };
};
