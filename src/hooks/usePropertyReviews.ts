import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PropertyReview {
  id: string;
  rating: number;
  communication_rating?: number;
  quality_rating?: number;
  professionalism_rating?: number;
  review_text?: string;
  would_work_again?: boolean;
  reviewer_type: 'host' | 'influencer';
  created_at: string;
  reviewer: {
    first_name?: string;
    last_name?: string;
    profile_photo_url?: string;
  };
}

export const usePropertyReviews = (propertyId: string | null) => {
  const [reviews, setReviews] = useState<PropertyReview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!propertyId) {
      setReviews([]);
      return;
    }

    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Step 1: Get applications for this property
        const { data: applications, error: appError } = await supabase
          .from('applications')
          .select('id')
          .eq('property_id', propertyId);

        if (appError) throw appError;
        if (!applications || applications.length === 0) {
          setReviews([]);
          setLoading(false);
          return;
        }

        const applicationIds = applications.map(a => a.id);

        // Step 2: Get collaboration agreements for these applications
        const { data: agreements, error: agError } = await supabase
          .from('collaboration_agreements')
          .select('id')
          .in('application_id', applicationIds);

        if (agError) throw agError;
        if (!agreements || agreements.length === 0) {
          setReviews([]);
          setLoading(false);
          return;
        }

        const agreementIds = agreements.map(a => a.id);

        // Step 3: Get reviews for these agreements with reviewer profiles
        const { data: reviewsData, error: reviewError } = await supabase
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
          .in('agreement_id', agreementIds)
          .eq('is_hidden', false)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (reviewError) throw reviewError;
        if (!reviewsData || reviewsData.length === 0) {
          setReviews([]);
          setLoading(false);
          return;
        }

        // Step 4: Get reviewer profiles
        const reviewerIds = [...new Set(reviewsData.map(r => r.reviewer_id))];
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, profile_photo_url')
          .in('id', reviewerIds);

        if (profileError) throw profileError;

        // Map profiles to reviews
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const formattedReviews: PropertyReview[] = reviewsData.map(review => ({
          id: review.id,
          rating: review.rating,
          communication_rating: review.communication_rating ?? undefined,
          quality_rating: review.quality_rating ?? undefined,
          professionalism_rating: review.professionalism_rating ?? undefined,
          review_text: review.review_text ?? undefined,
          would_work_again: review.would_work_again ?? undefined,
          reviewer_type: review.reviewer_type as 'host' | 'influencer',
          created_at: review.created_at,
          reviewer: {
            first_name: profileMap.get(review.reviewer_id)?.first_name ?? undefined,
            last_name: profileMap.get(review.reviewer_id)?.last_name ?? undefined,
            profile_photo_url: profileMap.get(review.reviewer_id)?.profile_photo_url ?? undefined,
          }
        }));

        setReviews(formattedReviews);
      } catch (error) {
        console.error('Error fetching property reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [propertyId]);

  return { reviews, loading };
};
