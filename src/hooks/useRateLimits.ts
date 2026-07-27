import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RateLimit {
  id: string;
  resource: string;
  limit_count: number;
  window_seconds: number;
  user_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useRateLimits = () => {
  const [limits, setLimits] = useState<RateLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLimits = async () => {
    try {
      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .order('resource', { ascending: true });

      if (error) throw error;
      setLimits(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching rate limits",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLimit = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('rate_limits')
        .update({ is_active: active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: active ? "Limit enabled" : "Limit disabled",
        description: "The rate limit has been updated successfully.",
      });

      fetchLimits();
    } catch (error: any) {
      toast({
        title: "Error updating rate limit",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createLimit = async (limit: Omit<RateLimit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('rate_limits')
        .insert(limit);

      if (error) throw error;

      toast({
        title: "Rate limit created",
        description: "The rate limit has been created successfully.",
      });

      fetchLimits();
    } catch (error: any) {
      toast({
        title: "Error creating rate limit",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateLimit = async (id: string, updates: Partial<RateLimit>) => {
    try {
      const { error } = await supabase
        .from('rate_limits')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Rate limit updated",
        description: "The rate limit has been updated successfully.",
      });

      fetchLimits();
    } catch (error: any) {
      toast({
        title: "Error updating rate limit",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLimits();

    const channel = supabase
      .channel('rate_limits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rate_limits'
        },
        () => fetchLimits()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    limits,
    loading,
    toggleLimit,
    createLimit,
    updateLimit,
    refetch: fetchLimits
  };
};
