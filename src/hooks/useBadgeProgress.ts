import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BadgeProgress {
  id: string;
  badge_id: string;
  current_progress: number;
  target_progress: number;
  progress_percentage: number;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier: string;
    points_reward: number;
  };
}

export const useBadgeProgress = (userId?: string) => {
  const [progress, setProgress] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: progressError } = await supabase
        .from('badge_progress')
        .select(`
          *,
          badge:badge_definitions (
            id,
            name,
            description,
            icon,
            category,
            tier,
            points_reward
          )
        `)
        .eq('user_id', userId)
        .lt('progress_percentage', 100)
        .order('progress_percentage', { ascending: false });

      if (progressError) throw progressError;
      setProgress(data || []);
    } catch (err) {
      console.error('Error fetching badge progress:', err);
      setError('Failed to load badge progress');
    } finally {
      setLoading(false);
    }
  };

  const getCloseToBadges = (threshold: number = 75) => {
    return progress.filter((p) => p.progress_percentage >= threshold);
  };

  return {
    progress,
    closeToBadges: getCloseToBadges(),
    loading,
    error,
    refetch: fetchProgress,
  };
};
