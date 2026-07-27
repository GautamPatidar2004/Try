import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CreatorReview {
  id: string;
  rating: number;
  communication_rating: number | null;
  quality_rating: number | null;
  professionalism_rating: number | null;
  review_text: string | null;
  would_work_again: boolean | null;
  reviewer_type: 'host' | 'influencer';
  created_at: string;
  reviewer: {
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
  };
}

interface CreatorReviewsData {
  reviews: CreatorReview[];
  averageRating: number;
  totalReviews: number;
  wouldWorkAgainPercentage: number;
  loading: boolean;
  error: string | null;
}

export const useCreatorReviews = (creatorId: string) => {
  const [data, setData] = useState<CreatorReviewsData>({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    wouldWorkAgainPercentage: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!creatorId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    fetchCreatorReviews();
  }, [creatorId]);

  const fetchCreatorReviews = async () => {
    try {
      // Fetch reviews where creator is the reviewee and reviewer is a host
      const { data: reviews, error } = await supabase
        .from('reviews_and_ratings')
        .select(`
          id,
          rating,
          communication_rating,
          quality_rating,
          professionalism_rating,
          review_text,
          would_work_again,
          reviewer_type,
          created_at,
          reviewer_id
        `)
        .eq('reviewee_id', creatorId)
        .eq('is_public', true)
        .eq('reviewer_type', 'host')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!reviews || reviews.length === 0) {
        setData({
          reviews: [],
          averageRating: 0,
          totalReviews: 0,
          wouldWorkAgainPercentage: 0,
          loading: false,
          error: null,
        });
        return;
      }

      // Fetch reviewer profiles
      const reviewerIds = reviews.map(r => r.reviewer_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_photo_url')
        .in('id', reviewerIds);

      if (profilesError) throw profilesError;

      // Map profiles to reviews
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const reviewsWithProfiles: CreatorReview[] = reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        communication_rating: review.communication_rating,
        quality_rating: review.quality_rating,
        professionalism_rating: review.professionalism_rating,
        review_text: review.review_text,
        would_work_again: review.would_work_again,
        reviewer_type: review.reviewer_type as 'host' | 'influencer',
        created_at: review.created_at,
        reviewer: {
          first_name: profilesMap.get(review.reviewer_id)?.first_name || null,
          last_name: profilesMap.get(review.reviewer_id)?.last_name || null,
          profile_photo_url: profilesMap.get(review.reviewer_id)?.profile_photo_url || null,
        },
      }));

      // Calculate stats
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

      const wouldWorkAgainReviews = reviews.filter(r => r.would_work_again !== null);
      const positiveReviews = wouldWorkAgainReviews.filter(r => r.would_work_again === true);
      const wouldWorkAgainPercentage = wouldWorkAgainReviews.length > 0
        ? Math.round((positiveReviews.length / wouldWorkAgainReviews.length) * 100)
        : 0;

      setData({
        reviews: reviewsWithProfiles,
        averageRating,
        totalReviews: reviews.length,
        wouldWorkAgainPercentage,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching creator reviews:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load reviews',
      }));
    }
  };

  return data;
};
