import { supabase } from "@/integrations/supabase/client";

export const isFeatureEnabled = async (flagName: string, userId?: string): Promise<boolean> => {
  try {
    const { data: flag, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('name', flagName)
      .single();

    if (error || !flag || !flag.is_enabled) return false;

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
  } catch (error) {
    console.error('Error checking feature flag:', error);
    return false;
  }
};

export const getFeatureVariant = async (testName: string, userId: string): Promise<string | null> => {
  try {
    const { data: test, error } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('name', testName)
      .eq('status', 'running')
      .single();

    if (error || !test) return null;

    const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const percentage = hash % 100;
    
    const variants = test.variants as Array<{ name: string; allocation: number }>;
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.allocation;
      if (percentage < cumulative) {
        return variant.name;
      }
    }
    
    return variants[0]?.name || null;
  } catch (error) {
    console.error('Error getting feature variant:', error);
    return null;
  }
};

export const canPerformAction = async (resource: string, userId: string, userType?: string): Promise<boolean> => {
  try {
    const { data: limit, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('resource', resource)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !limit) return true; // No limit configured

    // Check if limit applies to this user type
    if (limit.user_type && limit.user_type !== userType) {
      return true;
    }

    // Here you would typically check a Redis cache or similar
    // For now, we'll return true as rate limit tracking needs external storage
    return true;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return true;
  }
};
