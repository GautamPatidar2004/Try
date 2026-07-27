import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAIRecommendations = (userId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['ai-recommendations', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('influencer_id', userId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
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
      const { data, error } = await supabase.functions.invoke('generate-ai-recommendations');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations', userId] });
      toast({
        title: "Success",
        description: "AI recommendations generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      dismissReason 
    }: { 
      id: string; 
      status: 'completed' | 'dismissed'; 
      dismissReason?: string;
    }) => {
      const updates: any = {
        status,
        ...(status === 'completed' && { completed_at: new Date().toISOString() }),
        ...(status === 'dismissed' && dismissReason && { dismissed_reason: dismissReason }),
      };

      const { data, error } = await supabase
        .from('ai_recommendations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations', userId] });
      toast({
        title: "Updated",
        description: "Recommendation status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update recommendation",
        variant: "destructive",
      });
    },
  });

  const historyQuery = useQuery({
    queryKey: ['ai-recommendations-history', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('influencer_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return {
    recommendations,
    isLoading,
    generate: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    refetch,
    history: historyQuery.data,
    isLoadingHistory: historyQuery.isLoading,
  };
};