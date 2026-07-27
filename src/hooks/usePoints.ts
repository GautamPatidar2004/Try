import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserPoints {
  id: string;
  total_points: number;
  current_level: string;
  level_progress: number;
  points_to_next_level: number;
  lifetime_points: number;
}

interface PointTransaction {
  id: string;
  points: number;
  action_type: string;
  description: string;
  created_at: string;
}

export const usePoints = (userId?: string) => {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchPoints();
      fetchTransactions();
    }
  }, [userId]);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (pointsError && pointsError.code !== 'PGRST116') {
        throw pointsError;
      }

      if (!data) {
        // Initialize points for user if they don't exist
        const { data: newPoints, error: insertError } = await supabase
          .from('user_points')
          .insert([{ user_id: userId }])
          .select()
          .single();

        if (insertError) throw insertError;
        setPoints(newPoints);
      } else {
        setPoints(data);
      }
    } catch (err) {
      console.error('Error fetching points:', err);
      setError('Failed to load points');
      toast.error('Failed to load points');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error: txError } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (txError) throw txError;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const awardPoints = async (
    actionType: string,
    pointsAmount: number,
    description: string,
    relatedId?: string,
    relatedType?: string
  ) => {
    try {
      const { error: awardError } = await supabase.rpc('award_points', {
        p_user_id: userId,
        p_points: pointsAmount,
        p_action_type: actionType,
        p_description: description,
        p_related_id: relatedId || null,
        p_related_type: relatedType || null,
      });

      if (awardError) throw awardError;

      // Refresh points and transactions
      await fetchPoints();
      await fetchTransactions();

      toast.success(`+${pointsAmount} points! ${description}`);
    } catch (err) {
      console.error('Error awarding points:', err);
      toast.error('Failed to award points');
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Seedling':
        return '🌱';
      case 'Sprout':
        return '🌿';
      case 'Growing':
        return '🌳';
      case 'Rising Star':
        return '🌟';
      case 'Influencer':
        return '💫';
      case 'Elite Creator':
        return '👑';
      default:
        return '🌱';
    }
  };

  return {
    points,
    transactions,
    loading,
    error,
    awardPoints,
    refetch: fetchPoints,
    getLevelIcon,
  };
};
