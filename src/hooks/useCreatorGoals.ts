import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCreatorGoals = (userId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['creator-goals', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creator_goals')
        .select('*')
        .eq('influencer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const createGoal = useMutation({
    mutationFn: async (goal: {
      goal_type: string;
      target_value: number;
      deadline?: string;
    }) => {
      const { data, error } = await supabase
        .from('creator_goals')
        .insert({
          influencer_id: userId,
          ...goal,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-goals', userId] });
      toast({ title: 'Goal created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating goal', description: error.message, variant: 'destructive' });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('creator_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-goals', userId] });
      toast({ title: 'Goal updated successfully' });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('creator_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-goals', userId] });
      toast({ title: 'Goal deleted successfully' });
    },
  });

  return {
    goals,
    isLoading,
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    deleteGoal: deleteGoal.mutate,
  };
};