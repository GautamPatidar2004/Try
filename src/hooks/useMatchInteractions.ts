import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MatchInteraction {
  id: string;
  user_id: string;
  match_id: string | null;
  property_id: string | null;
  influencer_id: string | null;
  action: 'like' | 'pass' | 'super_like';
  created_at: string;
}

export const useMatchInteractions = (userId: string | null) => {
  const [interactions, setInteractions] = useState<MatchInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchInteractions();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchInteractions = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('match_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInteractions((data || []) as MatchInteraction[]);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your match history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const recordInteraction = async (
    matchId: string | null,
    propertyId: string | null,
    influencerId: string | null,
    action: 'like' | 'pass' | 'super_like'
  ) => {
    // Validate session exists
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session validation failed:', sessionError);
      toast({
        title: 'Session Expired',
        description: 'Please log in again to continue',
        variant: 'destructive',
      });
      return null;
    }

    // Get authenticated user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User validation failed:', userError);
      toast({
        title: 'Authentication Error',
        description: 'Please log in again',
        variant: 'destructive',
      });
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1500);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('match_interactions')
        .insert({
          user_id: user.id, // Use authenticated user ID
          match_id: matchId,
          property_id: propertyId,
          influencer_id: influencerId,
          action,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh interactions
      await fetchInteractions();

      return data;
    } catch (error: any) {
      console.error('Error recording interaction:', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      });

      // Handle JWT expiry specifically
      if (error?.message?.includes('JWT') || error?.code === 'PGRST301') {
        toast({
          title: 'Session Expired',
          description: 'Redirecting to login...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
        return null;
      }

      toast({
        title: 'Error',
        description: 'Failed to save your choice',
        variant: 'destructive',
      });
      return null;
    }
  };

  const hasInteracted = (matchId: string | null, propertyId: string | null, influencerId: string | null) => {
    return interactions.some(
      (i) =>
        (matchId && i.match_id === matchId) ||
        (propertyId && i.property_id === propertyId) ||
        (influencerId && i.influencer_id === influencerId)
    );
  };

  const getLikedMatches = () => {
    return interactions.filter((i) => i.action === 'like');
  };

  return {
    interactions,
    loading,
    recordInteraction,
    hasInteracted,
    getLikedMatches,
    refetch: fetchInteractions,
  };
};
