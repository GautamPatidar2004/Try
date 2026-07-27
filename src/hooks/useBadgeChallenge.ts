import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BadgeChallenge, BadgeProgress, BadgeCriteria } from '@/types/badge';
import { useToast } from '@/hooks/use-toast';

interface BadgeProgressResponse {
  id: string;
  user_id: string;
  badge_id: string;
  current_progress: number;
  target_progress: number;
  progress_percentage: number;
  last_updated: string;
  badge?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier: string;
    points_reward: number;
    criteria: any;
    is_active: boolean;
    display_order: number;
  };
}

export const useBadgeChallenge = (userId: string, badgeId: string) => {
  const [challenge, setChallenge] = useState<BadgeChallenge | null>(null);
  const [progress, setProgress] = useState<BadgeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId && badgeId) {
      fetchChallengeData();
    }
  }, [userId, badgeId]);

  // Real-time subscription for progress updates
  useEffect(() => {
    if (!userId || !badgeId) return;

    const channel = supabase
      .channel('badge-progress-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'badge_progress',
          filter: `user_id=eq.${userId},badge_id=eq.${badgeId}`
        },
        (payload) => {
          setProgress(payload.new as BadgeProgress);
          
          // Check if completed
          if ((payload.new as BadgeProgress).progress_percentage >= 100) {
            toast({
              title: "🎉 Badge Earned!",
              description: "Check your achievements!",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, badgeId]);

  const fetchChallengeData = async () => {
    try {
      setLoading(true);

      // Fetch or create challenge
      const { data: existingChallenge } = await supabase
        .from('badge_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .maybeSingle();

      setChallenge(existingChallenge as BadgeChallenge | null);

      // Fetch progress
      const { data: progressData } = await supabase
        .from('badge_progress')
        .select(`
          *,
          badge:badge_definitions(*)
        `)
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .maybeSingle();

      if (progressData) {
        const typedProgress: BadgeProgress = {
          ...progressData,
          badge: progressData.badge ? {
            ...progressData.badge,
            criteria: (typeof progressData.badge.criteria === 'object' && progressData.badge.criteria !== null 
              ? progressData.badge.criteria 
              : { type: 'general', tasks: [], total_steps: 1 }) as unknown as BadgeCriteria
          } : undefined
        };
        setProgress(typedProgress);
      }
    } catch (error) {
      console.error('Error fetching challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async () => {
    try {
      const { data, error } = await supabase
        .from('badge_challenges')
        .upsert({
          user_id: userId,
          badge_id: badgeId,
          status: 'in_progress' as string,
          started_at: new Date().toISOString(),
          steps_data: {}
        }, {
          onConflict: 'user_id,badge_id'
        })
        .select()
        .single();

      if (error) throw error;

      setChallenge(data as BadgeChallenge);

      // Initialize badge progress if not exists
      const { error: progressError } = await supabase
        .from('badge_progress')
        .upsert({
          user_id: userId,
          badge_id: badgeId,
          current_progress: 0,
          target_progress: progress?.badge?.criteria?.total_steps || 1,
          progress_percentage: 0
        }, {
          onConflict: 'user_id,badge_id'
        });

      if (progressError) throw progressError;

      toast({
        title: "Challenge Started!",
        description: "Good luck on your journey!",
      });

      await fetchChallengeData();
    } catch (error) {
      console.error('Error starting challenge:', error);
      toast({
        title: "Error",
        description: "Failed to start challenge. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateTaskProgress = async (taskId: string, completed: boolean) => {
    if (!challenge) return;

    try {
      const updatedStepsData = {
        ...challenge.steps_data,
        [taskId]: completed
      };

      // Update challenge steps
      const { error: challengeError } = await supabase
        .from('badge_challenges')
        .update({ 
          steps_data: updatedStepsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', challenge.id);

      if (challengeError) throw challengeError;

      // Calculate new progress
      const completedTasks = Object.values(updatedStepsData).filter(Boolean).length;
      const totalTasks = progress?.badge?.criteria?.total_steps || 1;
      const newPercentage = Math.round((completedTasks / totalTasks) * 100);

      // Update progress
      const { error: progressError } = await supabase
        .from('badge_progress')
        .update({
          current_progress: completedTasks,
          progress_percentage: newPercentage
        })
        .eq('user_id', userId)
        .eq('badge_id', badgeId);

      if (progressError) throw progressError;

      await fetchChallengeData();
    } catch (error) {
      console.error('Error updating task progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    challenge,
    progress,
    loading,
    startChallenge,
    updateTaskProgress,
    refetch: fetchChallengeData
  };
};
