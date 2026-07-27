import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_data: any;
  created_at: string;
}

export const useAchievements = (userId?: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchAchievements();
    }
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (achievementsError) throw achievementsError;
      setAchievements(data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const getRecentAchievements = (limit: number = 5) => {
    return achievements.slice(0, limit);
  };

  return {
    achievements,
    recentAchievements: getRecentAchievements(),
    loading,
    error,
    refetch: fetchAchievements,
  };
};
