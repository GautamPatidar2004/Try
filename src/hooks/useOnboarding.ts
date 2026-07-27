import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingProgress {
  id: string;
  user_id: string;
  current_step: number;
  completed_steps: any;
  total_steps: number;
  started_at: string;
  completed_at?: string;
  last_activity_at: string;
  completion_percentage: number;
  metadata: any;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  metadata: any;
}

export const useOnboarding = (userId: string | null) => {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [stepping, setStepping] = useState(false);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null);
  const { toast } = useToast();

  const getDisplayedBadges = (): Set<string> => {
    try {
      const stored = localStorage.getItem('displayedBadges');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const addDisplayedBadge = (badgeName: string) => {
    try {
      const current = getDisplayedBadges();
      current.add(badgeName);
      localStorage.setItem('displayedBadges', JSON.stringify([...current]));
    } catch {}
  };

  const fetchProgress = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching onboarding progress:', error);
        return;
      }
      setProgress(data);
    } catch (error) {
      console.error('Error in fetchProgress:', error);
    }
  }, [userId]);

  const fetchBadges = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          earned_at,
          metadata,
          badge_definitions!inner (
            name,
            description,
            icon
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error fetching badges:', error);
        return;
      }

      const formattedBadges: Badge[] = data?.map(badge => ({
        id: badge.id,
        name: badge.badge_definitions.name,
        description: badge.badge_definitions.description,
        icon: badge.badge_definitions.icon,
        earned_at: badge.earned_at,
        metadata: badge.metadata || {}
      })) || [];

      setBadges(formattedBadges);
    } catch (error) {
      console.error('Error in fetchBadges:', error);
    }
  }, [userId]);

  const updateStep = useCallback(async (step: number, stepData: Record<string, any> = {}, onComplete?: () => void) => {
    if (!userId || stepping) return;
    setStepping(true);

    try {
      const { error } = await supabase.rpc('update_onboarding_progress', {
        p_user_id: userId,
        p_step: step,
        p_step_data: stepData
      });

      if (error) {
        console.error('Error updating onboarding progress:', error);
        toast({
          title: "Error",
          description: "Failed to update progress. Please try again.",
          variant: "destructive"
        });
        setStepping(false);
        return;
      }

      // Advance UI immediately — don't block on background fetches
      if (onComplete) {
        onComplete();
      }

      // Background: refresh data and check badges (non-blocking)
      Promise.all([fetchProgress(), fetchBadges()]).then(async () => {
        const badgeNames = ['Welcome Aboard', 'Profile Builder', 'Collaboration Ready'];
        if (step <= badgeNames.length) {
          const badgeName = badgeNames[step - 1];
          const displayedBadges = getDisplayedBadges();

          if (!displayedBadges.has(badgeName)) {
            const { data } = await supabase
              .from('user_badges')
              .select(`
                id, earned_at, metadata,
                badge_definitions!inner (name, description, icon)
              `)
              .eq('user_id', userId)
              .eq('badge_definitions.name', badgeName)
              .order('earned_at', { ascending: false })
              .limit(1);

            if (data && data.length > 0) {
              const newBadge = data[0];
              addDisplayedBadge(badgeName);
              setNewlyEarnedBadge({
                id: newBadge.id,
                name: newBadge.badge_definitions.name,
                description: newBadge.badge_definitions.description,
                icon: newBadge.badge_definitions.icon,
                earned_at: newBadge.earned_at,
                metadata: newBadge.metadata || {}
              });
            }
          }
        }
      }).catch(() => {}).finally(() => setStepping(false));
    } catch (error) {
      console.error('Error in updateStep:', error);
      setStepping(false);
    }
  }, [userId, stepping, fetchProgress, fetchBadges, toast]);

  const initializeOnboarding = useCallback(async () => {
    if (!userId) return;
    // Initialize with step 1 if no progress exists
    if (!progress) {
      await updateStep(1);
    }
  }, [userId, progress, updateStep]);

  const isStepCompleted = (step: number): boolean => {
    if (!progress?.completed_steps) return false;
    const steps = Array.isArray(progress.completed_steps) ? progress.completed_steps : [];
    return steps.includes(step);
  };

  const getCompletionPercentage = (): number => {
    return progress?.completion_percentage || 0;
  };

  const isOnboardingComplete = (): boolean => {
    return getCompletionPercentage() === 100;
  };

  const dismissBadgeCelebration = () => {
    setNewlyEarnedBadge(null);
  };

  const setLocalStep = (step: number) => {
    setProgress(prev => prev ? { ...prev, current_step: step } : prev);
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProgress(), fetchBadges()]);
      setLoading(false);
    };
    init();
  }, [userId, fetchProgress, fetchBadges]);

  return {
    progress,
    badges,
    loading,
    stepping,
    newlyEarnedBadge,
    updateStep,
    initializeOnboarding,
    isStepCompleted,
    getCompletionPercentage,
    isOnboardingComplete,
    dismissBadgeCelebration,
    setLocalStep,
    refreshData: () => Promise.all([fetchProgress(), fetchBadges()])
  };
};
