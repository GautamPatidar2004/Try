import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useContentIntelligence = (userId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['content-intelligence', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_intelligence_reports')
        .select('*')
        .eq('influencer_id', userId)
        .gt('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-content-intelligence');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-intelligence', userId] });
      toast({
        title: "Success",
        description: "Intelligence report generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate intelligence report",
        variant: "destructive",
      });
    },
  });

  const historyQuery = useQuery({
    queryKey: ['content-intelligence-history', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_intelligence_reports')
        .select('*')
        .eq('influencer_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return {
    report,
    isLoading,
    generate: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    refetch,
    history: historyQuery.data,
    isLoadingHistory: historyQuery.isLoading,
  };
};