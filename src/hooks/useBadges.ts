import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  display_order: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  metadata: any;
}

interface Badge extends BadgeDefinition {
  earned: boolean;
  earned_at?: string;
  metadata?: any;
}

export const useBadges = (userId?: string) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchBadges();
    }
  }, [userId]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all badge definitions
      const { data: badgeDefinitions, error: badgeError } = await supabase
        .from('badge_definitions')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (badgeError) throw badgeError;

      // Fetch user's earned badges
      const { data: userBadges, error: userBadgeError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      if (userBadgeError) throw userBadgeError;

      setEarnedBadges(userBadges || []);

      // Combine badge definitions with earned status
      const combinedBadges: Badge[] = (badgeDefinitions || []).map(badge => {
        const earnedBadge = userBadges?.find(ub => ub.badge_id === badge.id);
        return {
          ...badge,
          earned: !!earnedBadge,
          earned_at: earnedBadge?.earned_at,
          metadata: earnedBadge?.metadata
        };
      });

      setBadges(combinedBadges);
    } catch (err) {
      console.error('Error fetching badges:', err);
      setError('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const getEarnedBadges = () => badges.filter(badge => badge.earned);
  const getUnEarnedBadges = () => badges.filter(badge => !badge.earned);
  const getCompletionPercentage = () => {
    if (badges.length === 0) return 0;
    return Math.round((getEarnedBadges().length / badges.length) * 100);
  };

  return {
    badges,
    earnedBadges: getEarnedBadges(),
    unEarnedBadges: getUnEarnedBadges(),
    completionPercentage: getCompletionPercentage(),
    loading,
    error,
    refetch: fetchBadges
  };
};