import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompletionData {
  completionScore: number;
  missingFields: string[];
  isComplete: boolean;
}

export const useProfileCompletion = (userId: string | undefined) => {
  const [completion, setCompletion] = useState<ProfileCompletionData>({
    completionScore: 0,
    missingFields: [],
    isComplete: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const calculateCompletion = async () => {
      try {
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, bio, location, profile_photo_url, user_type')
          .eq('id', userId)
          .single();

        if (!profile) {
          setLoading(false);
          return;
        }

        // Only check for influencers
        if (profile.user_type !== 'influencer') {
          setCompletion({
            completionScore: 100,
            missingFields: [],
            isComplete: true
          });
          setLoading(false);
          return;
        }

        // Fetch influencer data
        const { data: influencer } = await supabase
          .from('influencers')
          .select('instagram_url, youtube_url, twitter_url, total_followers')
          .eq('id', userId)
          .maybeSingle();

        const missingFields: string[] = [];
        let score = 0;

        // Check required fields with weights
        const checks = [
          { field: profile.first_name, weight: 10, label: 'First name' },
          { field: profile.last_name, weight: 10, label: 'Last name' },
          { field: profile.bio && profile.bio.length >= 50, weight: 20, label: 'Bio (at least 50 characters)' },
          { field: profile.location, weight: 15, label: 'Location' },
          { field: profile.profile_photo_url, weight: 15, label: 'Profile picture' },
        ];

        checks.forEach(check => {
          if (check.field) {
            score += check.weight;
          } else {
            missingFields.push(check.label);
          }
        });

        // Check social accounts (30 points total)
        const hasInstagram = influencer?.instagram_url?.trim();
        const hasYoutube = influencer?.youtube_url?.trim();
        const hasTwitter = influencer?.twitter_url?.trim();
        const hasFollowers = (influencer?.total_followers || 0) > 0;

        if (hasInstagram || hasYoutube || hasTwitter) {
          score += 15;
        } else {
          missingFields.push('At least one social account');
        }

        if (hasFollowers) {
          score += 15;
        } else {
          missingFields.push('Follower count');
        }

        setCompletion({
          completionScore: score,
          missingFields,
          isComplete: score >= 100
        });
      } catch (error) {
        console.error('Error calculating profile completion:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateCompletion();
  }, [userId]);

  return { ...completion, loading };
};
