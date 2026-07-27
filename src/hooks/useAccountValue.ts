import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAccountValue = (userId: string) => {
  return useQuery({
    queryKey: ['account-value', userId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('calculate-account-value', {
        body: { userId },
      });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};