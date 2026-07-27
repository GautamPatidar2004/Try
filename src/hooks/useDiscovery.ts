import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAIMatches } from './useAIMatches';
import { useMatchInteractions } from './useMatchInteractions';
import { mockInfluencerMatches, mockHostMatches } from '@/data/mockDiscoveryData';

// Set to false to use real AI match data from database
const USE_MOCK_DATA = false;

export const useDiscovery = (userId: string | null, userType: 'influencer' | 'host' | null) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { matches, loading: matchesLoading, calculateMatch } = useAIMatches(userId, userType);
  const { hasInteracted, recordInteraction } = useMatchInteractions(userId);

  useEffect(() => {
    if (userId && userType) {
      buildQueue();
    } else {
      setLoading(false);
    }
  }, [userId, userType, matches]);

  const buildQueue = async () => {
    if (!userId || !userType) return;

    setLoading(true);
    try {
      // Use mock data in development mode
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (userType === 'influencer') {
          // Return mock property matches for influencers
          const mockQueue = mockInfluencerMatches.filter((match) => {
            return !hasInteracted(
              match.id,
              match.property_id,
              match.influencer_id
            );
          });
          setQueue(mockQueue);
        } else if (userType === 'host') {
          // Return mock influencer matches for hosts
          const mockQueue = mockHostMatches.filter((match) => {
            return !hasInteracted(
              match.id,
              match.property_id,
              match.influencer_id
            );
          });
          setQueue(mockQueue);
        }
        setLoading(false);
        return;
      }

      // Production code: Filter out already interacted matches
      const unseenMatches = matches.filter((match) => {
        return !hasInteracted(
          match.id,
          match.property_id,
          match.influencer_id
        );
      });

      // If influencer, fetch property details
      if (userType === 'influencer') {
        const propertyIds = unseenMatches.map((m) => m.property_id);
        const { data: properties } = await supabase
          .from('properties')
          .select('*, property_images(*), hosts:host_id(*, profiles:id(*))')
          .in('id', propertyIds)
          .eq('is_active', true);

        if (properties) {
          const enrichedQueue = unseenMatches.map((match) => {
            const property = properties.find((p) => p.id === match.property_id);
            return { ...match, property };
          }).filter((item) => item.property);

          setQueue(enrichedQueue);
        }
      }
      // If host, fetch influencer details
      else if (userType === 'host') {
        const influencerIds = unseenMatches.map((m) => m.influencer_id);
        const { data: influencers } = await (supabase
          .from('profiles') as any)
          .select('*, influencers!inner(*), social_accounts(*)')
          .in('id', influencerIds)
          .eq('user_type', 'influencer');

        if (influencers) {
          const enrichedQueue = unseenMatches.map((match) => {
            const influencer = influencers.find((i) => i.id === match.influencer_id);
            return { ...match, influencer };
          }).filter((item) => item.influencer);

          setQueue(enrichedQueue);
        }
      }
    } catch (error) {
      console.error('Error building discovery queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to load discovery queue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (
    action: 'like' | 'pass',
    matchId: string,
    propertyId: string | null,
    influencerId: string | null
  ) => {
    const result = await recordInteraction(matchId, propertyId, influencerId, action);
    
    if (!result) {
      console.error('Failed to record interaction for:', { action, matchId, propertyId, influencerId });
      return; // Don't remove from queue if recording failed
    }

    // Remove from queue
    setQueue((prev) => prev.filter((item) => item.id !== matchId));

    // Check for mutual match if it's a like
    if (action === 'like' && userId) {
      await checkMutualMatch(propertyId, influencerId);
    }
  };

  const checkMutualMatch = async (propertyId: string | null, influencerId: string | null) => {
    if (!userId || !propertyId || !influencerId) return;

    try {
      const { data, error } = await supabase.rpc('check_mutual_match', {
        p_user_id: userId,
        p_other_user_id: userType === 'host' ? influencerId : userId,
        p_property_id: propertyId,
      });

      if (error) throw error;

      const matchData = data as any;
      if (matchData?.is_match) {
        // Get property name for context
        const { data: propertyData } = await supabase
          .from('properties')
          .select('title')
          .eq('id', propertyId)
          .maybeSingle();

        // Auto-send conversation starter message
        const starterMessage = `🎉 You matched! You both liked ${propertyData?.title || 'this property'}. Start chatting to discuss collaboration opportunities!`;
        
        await supabase.from('messages').insert({
          sender_id: userId,
          receiver_id: matchData.matched_user_id,
          content: starterMessage,
          application_id: null,
        });

        // Update mutual_matches to mark conversation started
        const user1Id = userId < matchData.matched_user_id ? userId : matchData.matched_user_id;
        const user2Id = userId < matchData.matched_user_id ? matchData.matched_user_id : userId;
        
        await supabase
          .from('mutual_matches')
          .update({ conversation_started: true })
          .match({
            user1_id: user1Id,
            user2_id: user2Id,
            property_id: propertyId
          });

        // Show enhanced toast
        toast({
          title: "🎉 It's a Match!",
          description: `You both liked each other${matchData.match_score ? ` (${matchData.match_score}% match)` : ''}! A conversation has been started. Check your Profile → Messages tab to start chatting!`,
          duration: 8000,
        });

        // Create notification for the other user
        await supabase.from('notifications').insert({
          user_id: matchData.matched_user_id,
          type: 'mutual_match',
          title: "It's a Match!",
          message: 'You have a new mutual match. Check your messages!',
          related_id: propertyId,
        });
      }
    } catch (error) {
      console.error('Error checking mutual match:', error);
    }
  };

  return {
    queue,
    loading: loading || matchesLoading,
    handleSwipe,
    refetch: buildQueue,
  };
};
