import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_user_types: string[];
  target_user_ids: string[];
  environment: 'production' | 'staging' | 'development';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setFlags(data as FeatureFlag[] || []);
    } catch (error: any) {
      toast({
        title: "Error fetching feature flags",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFeatureEnabled = async (flagName: string, userId?: string) => {
    const flag = flags.find(f => f.name === flagName);
    if (!flag || !flag.is_enabled) return false;

    // If targeted to specific users
    if (userId && flag.target_user_ids.length > 0) {
      return flag.target_user_ids.includes(userId);
    }

    // Check rollout percentage
    if (flag.rollout_percentage < 100 && userId) {
      const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const userPercentage = hash % 100;
      return userPercentage < flag.rollout_percentage;
    }

    return flag.rollout_percentage === 100;
  };

  const toggleFlag = async (id: string, enabled: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: enabled ? "Feature enabled" : "Feature disabled",
        description: "The feature flag has been updated successfully.",
      });

      fetchFlags();
    } catch (error: any) {
      toast({
        title: "Error updating feature flag",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateRollout = async (id: string, percentage: number) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ rollout_percentage: percentage, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Rollout updated",
        description: `Feature rollout set to ${percentage}%`,
      });

      fetchFlags();
    } catch (error: any) {
      toast({
        title: "Error updating rollout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createFlag = async (flag: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('feature_flags')
        .insert({ ...flag, created_by: user?.id });

      if (error) throw error;

      toast({
        title: "Feature flag created",
        description: "The feature flag has been created successfully.",
      });

      fetchFlags();
    } catch (error: any) {
      toast({
        title: "Error creating feature flag",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFlags();

    const channel = supabase
      .channel('feature_flags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        () => fetchFlags()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    flags,
    loading,
    isFeatureEnabled,
    toggleFlag,
    updateRollout,
    createFlag,
    refetch: fetchFlags
  };
};
