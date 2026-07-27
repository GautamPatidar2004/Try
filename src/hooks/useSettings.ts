import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PlatformSetting {
  id: string;
  key: string;
  value: any;
  type: 'boolean' | 'string' | 'number' | 'json';
  category: 'general' | 'features' | 'api' | 'rate_limiting' | 'maintenance';
  description: string;
  is_public: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;
      setSettings(data as PlatformSetting[] || []);
    } catch (error: any) {
      toast({
        title: "Error fetching settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key: string) => {
    return settings.find(s => s.key === key);
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('platform_settings')
        .update({ 
          value,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('key', key);

      if (error) throw error;

      toast({
        title: "Setting updated",
        description: "The setting has been updated successfully.",
      });

      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error updating setting",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createSetting = async (setting: Omit<PlatformSetting, 'id' | 'created_at' | 'updated_at' | 'updated_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('platform_settings')
        .insert({ ...setting, updated_by: user?.id });

      if (error) throw error;

      toast({
        title: "Setting created",
        description: "The setting has been created successfully.",
      });

      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error creating setting",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel('platform_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_settings'
        },
        () => fetchSettings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    settings,
    loading,
    getSetting,
    updateSetting,
    createSetting,
    refetch: fetchSettings
  };
};
