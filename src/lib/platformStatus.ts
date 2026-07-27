import { supabase } from "@/integrations/supabase/client";

export const isMaintenanceMode = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .eq('is_public', true)
      .maybeSingle();

    if (error || !data) return false;
    return data.value === true;
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return false;
  }
};

export const getMaintenanceMessage = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'maintenance_message')
      .eq('is_public', true)
      .maybeSingle();

    if (error || !data) return 'The platform is currently under maintenance. Please check back soon.';
    return data.value as string;
  } catch (error) {
    console.error('Error getting maintenance message:', error);
    return 'The platform is currently under maintenance. Please check back soon.';
  }
};

export const isUserWhitelisted = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'maintenance_whitelist')
      .maybeSingle();

    if (error || !data) return false;
    const whitelist = data.value as string[];
    return whitelist.includes(userId);
  } catch (error) {
    console.error('Error checking whitelist:', error);
    return false;
  }
};
