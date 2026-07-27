import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReviewFilters {
  search?: string;
  rating?: number;
  status?: 'all' | 'flagged' | 'hidden' | 'public';
  reviewerType?: 'all' | 'host' | 'influencer';
  dateFrom?: string;
  dateTo?: string;
}

export const useReviews = (filters?: ReviewFilters) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    flagged: 0,
    hidden: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('reviews_and_ratings')
        .select(`
          *,
          reviewer:profiles!reviewer_id(id, first_name, last_name, profile_photo_url),
          reviewee:profiles!reviewee_id(id, first_name, last_name, profile_photo_url),
          agreement:collaboration_agreements(id, status)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(`review_text.ilike.%${filters.search}%`);
      }
      
      if (filters?.rating) {
        query = query.eq('rating', filters.rating);
      }
      
      if (filters?.status === 'flagged') {
        query = query.eq('is_flagged', true);
      } else if (filters?.status === 'hidden') {
        query = query.eq('is_hidden', true);
      } else if (filters?.status === 'public') {
        query = query.eq('is_public', true).eq('is_hidden', false);
      }
      
      if (filters?.reviewerType && filters.reviewerType !== 'all') {
        query = query.eq('reviewer_type', filters.reviewerType);
      }
      
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setReviews(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const flagged = data?.filter(r => r.is_flagged).length || 0;
      const hidden = data?.filter(r => r.is_hidden).length || 0;
      const avgRating = total > 0 
        ? data.reduce((sum, r) => sum + r.rating, 0) / total 
        : 0;
      
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      data?.forEach(r => {
        distribution[r.rating as keyof typeof distribution]++;
      });
      
      setStats({
        total,
        flagged,
        hidden,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingDistribution: distribution
      });
      
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const flagReview = async (reviewId: string, reason: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('reviews_and_ratings')
        .update({
          is_flagged: true,
          flag_reason: reason,
          flagged_by: user?.id,
          flagged_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      // Log admin activity
      if (user?.id) {
        await supabase.from('admin_activity_log').insert({
          admin_id: user.id,
          action: 'flag_review',
          target_type: 'review',
          target_id: reviewId,
          details: { reason }
        });
      }

      toast({
        title: "Success",
        description: "Review flagged successfully"
      });
      
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const unflagReview = async (reviewId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('reviews_and_ratings')
        .update({
          is_flagged: false,
          flag_reason: null,
          admin_reviewed_by: user?.id,
          admin_reviewed_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      if (user?.id) {
        await supabase.from('admin_activity_log').insert({
          admin_id: user.id,
          action: 'unflag_review',
          target_type: 'review',
          target_id: reviewId
        });
      }

      toast({
        title: "Success",
        description: "Review unflagged successfully"
      });
      
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const hideReview = async (reviewId: string, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('reviews_and_ratings')
        .update({
          is_hidden: true,
          admin_notes: notes,
          admin_reviewed_by: user?.id,
          admin_reviewed_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      if (user?.id) {
        await supabase.from('admin_activity_log').insert({
          admin_id: user.id,
          action: 'hide_review',
          target_type: 'review',
          target_id: reviewId,
          details: { notes }
        });
      }

      toast({
        title: "Success",
        description: "Review hidden successfully"
      });
      
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const unhideReview = async (reviewId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('reviews_and_ratings')
        .update({
          is_hidden: false,
          admin_reviewed_by: user?.id,
          admin_reviewed_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      if (user?.id) {
        await supabase.from('admin_activity_log').insert({
          admin_id: user.id,
          action: 'unhide_review',
          target_type: 'review',
          target_id: reviewId
        });
      }

      toast({
        title: "Success",
        description: "Review unhidden successfully"
      });
      
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateAdminNotes = async (reviewId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('reviews_and_ratings')
        .update({ admin_notes: notes })
        .eq('id', reviewId);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.id) {
        await supabase.from('admin_activity_log').insert({
          admin_id: user.id,
          action: 'update_review_notes',
          target_type: 'review',
          target_id: reviewId
        });
      }

      toast({
        title: "Success",
        description: "Notes updated successfully"
      });
      
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    reviews,
    loading,
    stats,
    flagReview,
    unflagReview,
    hideReview,
    unhideReview,
    updateAdminNotes,
    refetch: fetchReviews
  };
};
