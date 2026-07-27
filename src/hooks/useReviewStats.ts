import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  wouldWorkAgainPercentage: number;
  ratingDistribution: { [key: number]: number };
  loading: boolean;
}

export const useReviewStats = (userId: string, userType: 'host' | 'influencer') => {
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    wouldWorkAgainPercentage: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    loading: true,
  });

  useEffect(() => {
    if (!userId) return;
    
    fetchReviewStats();
  }, [userId, userType]);

  const fetchReviewStats = async () => {
    try {
      // Fetch all reviews where user is the reviewee
      const { data: reviews, error } = await supabase
        .from('reviews_and_ratings')
        .select('rating, would_work_again')
        .eq('reviewee_id', userId)
        .eq('is_public', true);

      if (error) throw error;

      if (!reviews || reviews.length === 0) {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          wouldWorkAgainPercentage: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          loading: false,
        });
        return;
      }

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Calculate would work again percentage
      const wouldWorkAgainReviews = reviews.filter(r => r.would_work_again !== null);
      const positiveReviews = wouldWorkAgainReviews.filter(r => r.would_work_again === true);
      const wouldWorkAgainPercentage = wouldWorkAgainReviews.length > 0 
        ? (positiveReviews.length / wouldWorkAgainReviews.length) * 100 
        : 0;

      // Calculate rating distribution
      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      setStats({
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        wouldWorkAgainPercentage: Math.round(wouldWorkAgainPercentage),
        ratingDistribution,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching review stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return stats;
};

// Hook for property-specific review stats (reviews of hosts from their properties)
export const usePropertyReviewStats = (hostId: string) => {
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    wouldWorkAgainPercentage: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    loading: true,
  });

  useEffect(() => {
    if (!hostId) return;
    
    fetchPropertyReviewStats();
  }, [hostId]);

  const fetchPropertyReviewStats = async () => {
    try {
      // Get reviews for this host from collaboration agreements
      const { data: reviews, error } = await supabase
        .from('reviews_and_ratings')
        .select(`
          rating, 
          would_work_again,
          collaboration_agreements!inner(host_id)
        `)
        .eq('collaboration_agreements.host_id', hostId)
        .eq('reviewer_type', 'influencer')
        .eq('is_public', true);

      if (error) throw error;

      if (!reviews || reviews.length === 0) {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          wouldWorkAgainPercentage: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          loading: false,
        });
        return;
      }

      // Calculate stats (same logic as useReviewStats)
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      const wouldWorkAgainReviews = reviews.filter(r => r.would_work_again !== null);
      const positiveReviews = wouldWorkAgainReviews.filter(r => r.would_work_again === true);
      const wouldWorkAgainPercentage = wouldWorkAgainReviews.length > 0 
        ? (positiveReviews.length / wouldWorkAgainReviews.length) * 100 
        : 0;

      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      setStats({
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        wouldWorkAgainPercentage: Math.round(wouldWorkAgainPercentage),
        ratingDistribution,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching property review stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return stats;
};