import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIMatch {
  id: string;
  influencer_id: string;
  property_id: string;
  match_score: number;
  match_reasons: string[];
  ai_recommendation: string;
  calculation_metadata: any;
  created_at: string;
  updated_at: string;
}

export const useAIMatches = (userId: string | null, userType: 'influencer' | 'host' | null) => {
  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId && userType) {
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [userId, userType]);

  const fetchMatches = async () => {
    if (!userId || !userType) return;

    try {
      setLoading(true);
      let query = supabase
        .from('ai_match_scores')
        .select('id, influencer_id, property_id, match_score, match_reasons, ai_recommendation, created_at, updated_at');

      if (userType === 'influencer') {
        query = query.eq('influencer_id', userId);
      } else if (userType === 'host') {
        // For hosts, get matches for their properties (optimized with single query)
        const { data: properties } = await supabase
          .from('properties')
          .select('id')
          .eq('host_id', userId);
        
        if (properties && properties.length > 0) {
          const propertyIds = properties.map(p => p.id);
          query = query.in('property_id', propertyIds);
        }
      }

      const { data, error } = await query.order('match_score', { ascending: false });

      if (error) throw error;
      setMatches((data || []).map(match => ({
        ...match,
        match_reasons: (match.match_reasons as unknown as string[]) || [],
      })) as AIMatch[]);
    } catch (error) {
      console.error('Error fetching AI matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI matches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMatch = async (influencerId: string, propertyId: string) => {
    try {
      setCalculating(true);
      const { data, error } = await supabase.functions.invoke('calculate-ai-match', {
        body: { influencerId, propertyId }
      });

      if (error) throw error;

      // Refresh matches after calculation
      await fetchMatches();
      
      return data;
    } catch (error) {
      console.error('Error calculating match:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to calculate match',
        variant: 'destructive',
      });
      return null;
    } finally {
      setCalculating(false);
    }
  };

  const getMatchForProperty = (propertyId: string): AIMatch | null => {
    return matches.find(m => m.property_id === propertyId) || null;
  };

  const getMatchForInfluencer = (influencerId: string): AIMatch | null => {
    return matches.find(m => m.influencer_id === influencerId) || null;
  };

  const getTopMatches = (threshold: number = 80): AIMatch[] => {
    return matches.filter(m => m.match_score >= threshold);
  };

  return {
    matches,
    loading,
    calculating,
    fetchMatches,
    calculateMatch,
    getMatchForProperty,
    getMatchForInfluencer,
    getTopMatches,
  };
};