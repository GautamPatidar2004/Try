import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useContentRecommendations = (userId: string) => {
  return useQuery({
    queryKey: ['content-recommendations', userId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-content-recommendations', {
        body: { userId },
      });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};