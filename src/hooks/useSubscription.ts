import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_applications_per_month: number;
  max_brand_partnerships: number;
  trial_days?: number;
  // New two-sided marketplace fields
  user_type_category: 'demand' | 'supply';
  max_listings: number | null;
  max_campaigns: number | null;
  max_profile_views_per_month: number | null;
  max_outbound_invites_per_month: number | null;
  max_pitches_per_month: number | null;
  search_priority: number;
  has_verified_badge: boolean;
  has_ai_matching: boolean;
  has_media_kit: boolean;
  has_advanced_analytics: boolean;
  team_seats: number;
  marketplace_boosts_per_month: number;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  plan: {
    name: string;
    description: string;
    features: string[];
    maxApplicationsPerMonth: number;
    maxBrandPartnerships: number;
    // New fields
    userTypeCategory: 'demand' | 'supply';
    maxListings: number | null;
    maxCampaigns: number | null;
    maxProfileViewsPerMonth: number | null;
    maxOutboundInvitesPerMonth: number | null;
    maxPitchesPerMonth: number | null;
    searchPriority: number;
    hasVerifiedBadge: boolean;
    hasAiMatching: boolean;
    hasMediaKit: boolean;
    hasAdvancedAnalytics: boolean;
    teamSeats: number;
    marketplaceBoostsPerMonth: number;
  } | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  billingInterval: string | null;
  isTrialing?: boolean;
  hasPremiumOverride?: boolean;
}

export type UserType = 'influencer' | 'host' | 'brand' | 'restaurant_owner' | null;
export type UserTypeCategory = 'demand' | 'supply' | null;

export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const loading = statusLoading || actionLoading;
  const [userType, setUserType] = useState<UserType>(null);
  const [userTypeCategory, setUserTypeCategory] = useState<UserTypeCategory>(null);
  const [userTypeChecked, setUserTypeChecked] = useState(false);
  const { toast } = useToast();

  // Legacy compatibility
  const isInfluencer = userType === 'influencer';

  // Get user type category based on user type
  const getUserTypeCategory = (type: UserType): UserTypeCategory => {
    if (!type) return null;
    if (type === 'influencer') return 'supply';
    return 'demand'; // host, brand, restaurant_owner
  };

  // Check user type from profile
  const checkUserType = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserType(null);
        setUserTypeCategory(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      const type = profile?.user_type as UserType;
      setUserType(type);
      setUserTypeCategory(getUserTypeCategory(type));
    } catch (error) {
      console.error('Error checking user type:', error);
      setUserType(null);
      setUserTypeCategory(null);
    } finally {
      setUserTypeChecked(true);
    }
  };

  // Fetch subscription plans filtered by user type category
  const fetchSubscriptionPlans = async (category?: UserTypeCategory) => {
    try {
      let query = supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      // Filter by category if provided
      if (category) {
        query = query.eq('user_type_category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const plans: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly || 0,
        features: Array.isArray(plan.features) ? plan.features.filter((f): f is string => typeof f === 'string') : [],
        max_applications_per_month: plan.max_applications_per_month || 0,
        max_brand_partnerships: plan.max_brand_partnerships || 0,
        trial_days: plan.trial_days || 0,
        // New fields
        user_type_category: (plan.user_type_category || 'supply') as 'demand' | 'supply',
        max_listings: plan.max_listings,
        max_campaigns: plan.max_campaigns,
        max_profile_views_per_month: plan.max_profile_views_per_month,
        max_outbound_invites_per_month: plan.max_outbound_invites_per_month,
        max_pitches_per_month: plan.max_pitches_per_month,
        search_priority: plan.search_priority || 1,
        has_verified_badge: plan.has_verified_badge || false,
        has_ai_matching: plan.has_ai_matching || false,
        has_media_kit: plan.has_media_kit || false,
        has_advanced_analytics: plan.has_advanced_analytics || false,
        team_seats: plan.team_seats || 1,
        marketplace_boosts_per_month: plan.marketplace_boosts_per_month || 0
      }));
      
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    }
  };

  // Check subscription status for any user type
  const checkSubscriptionStatus = async () => {
    if (!userType) {
      setSubscriptionStatus({
        hasActiveSubscription: false,
        subscriptionStatus: null,
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        billingInterval: null,
        isTrialing: false,
        hasPremiumOverride: false
      });
      return;
    }

    setStatusLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('check-subscription-status', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
      setSubscriptionStatus({
        hasActiveSubscription: false,
        subscriptionStatus: null,
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        billingInterval: null,
        isTrialing: false,
        hasPremiumOverride: false
      });
    } finally {
      setStatusLoading(false);
    }
  };

  // Create subscription
  const createSubscription = async (planId: string, billingInterval: 'monthly' | 'yearly' = 'monthly', returnUrl?: string) => {
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { planId, billingInterval, returnUrl },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }

      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subscription",
        variant: "destructive",
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Manage subscription (customer portal)
  const manageSubscription = async () => {
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // No Stripe customer yet — user has never subscribed. Send them to /pricing.
      if (data?.error === 'no_customer') {
        toast({
          title: "No active subscription",
          description: "Please choose a plan to get started.",
        });
        window.location.href = '/pricing';
        return;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Billing Portal (handles upgrade, downgrade, cancel, reactivate, payment update)
      if (data?.url) {
        window.location.href = data.url;
      }

      return data;
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to access subscription management",
        variant: "destructive",
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to get remaining applications with a default limit fallback
  const getRemainingApplicationsWithDefault = async (defaultLimit: number): Promise<number | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
      const { data: applications, error } = await supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .eq('influencer_id', user.id)
        .gte('created_at', periodStart.toISOString());
      
      if (error) {
        console.error('Error fetching applications:', error);
        return defaultLimit; // On error, allow applications
      }
      
      const usedApplications = applications?.length || 0;
      return Math.max(0, defaultLimit - usedApplications);
    } catch (error) {
      console.error('Error getting remaining applications:', error);
      return defaultLimit;
    }
  };

  // Check if user can apply to properties (async with pitch limit check)
  const canApplyToProperties = async (): Promise<{ allowed: boolean; remaining: number | null; limit: number | null }> => {
    // If subscription not loaded yet, allow with default free tier limits
    if (!subscriptionStatus?.plan) {
      // Fallback to free tier: 10 applications/month
      const remaining = await getRemainingApplicationsWithDefault(1);
      return { 
        allowed: remaining === null || remaining > 0, 
        remaining, 
        limit: 1 
      };
    }
    
    const maxPitches = subscriptionStatus.plan.maxPitchesPerMonth;
    
    // Unlimited pitches (-1 or null for paid plans)
    if (!maxPitches || maxPitches === -1) {
      return { allowed: true, remaining: null, limit: null };
    }
    
    // Count pitches this month
    const remaining = await getRemainingApplications();
    return { 
      allowed: remaining === null || remaining > 0, 
      remaining, 
      limit: maxPitches 
    };
  };

  // Convenience method to check feature access
  const hasFeature = (feature: string): boolean => {
    if (!subscriptionStatus?.plan) return false;
    switch (feature) {
      case 'mediaKit': return subscriptionStatus.plan.hasMediaKit;
      case 'advancedAnalytics': return subscriptionStatus.plan.hasAdvancedAnalytics;
      case 'verifiedBadge': return subscriptionStatus.plan.hasVerifiedBadge;
      case 'aiMatching': return subscriptionStatus.plan.hasAiMatching;
      case 'profileBoosts': return (subscriptionStatus.plan.marketplaceBoostsPerMonth ?? 0) > 0;
      case 'prioritySearch': return (subscriptionStatus.plan.searchPriority ?? 1) > 1;
      case 'unlimitedPitches':
        return subscriptionStatus.plan.maxPitchesPerMonth === null || subscriptionStatus.plan.maxPitchesPerMonth === -1;
      case 'unlimitedBrowsing':
        return subscriptionStatus.plan.name !== 'Creator Starter';
      default: return false;
    }
  };

  // Plan tier checks
  const isPaidPlan = subscriptionStatus?.plan?.name 
    ? !['Creator Starter', 'Free'].includes(subscriptionStatus.plan.name) 
    : false;
  const isProPlan = subscriptionStatus?.plan?.name === 'Creator Pro' || subscriptionStatus?.plan?.name === 'Growth' || subscriptionStatus?.plan?.name === 'Extended Stay';
  const isPremiumPlan = subscriptionStatus?.plan?.name === 'Creator Premium' || subscriptionStatus?.plan?.name === 'Scale' || subscriptionStatus?.plan?.name === 'Owner';

  // ---- Profile Boosts ----
  const getRemainingBoostsThisMonth = async (): Promise<{ limit: number; used: number; remaining: number }> => {
    const limit = subscriptionStatus?.plan?.marketplaceBoostsPerMonth ?? 0;
    if (limit <= 0) return { limit: 0, used: 0, remaining: 0 };
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { limit, used: 0, remaining: limit };
      const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const { count } = await supabase
        .from('creator_profile_boosts')
        .select('id', { count: 'exact', head: true })
        .eq('influencer_id', user.id)
        .gte('boosted_at', periodStart.toISOString());
      const used = count || 0;
      return { limit, used, remaining: Math.max(0, limit - used) };
    } catch (e) {
      console.error('Error fetching boosts:', e);
      return { limit, used: 0, remaining: limit };
    }
  };

  const activateProfileBoost = async (): Promise<boolean> => {
    const { remaining } = await getRemainingBoostsThisMonth();
    if (remaining <= 0) {
      toast({ title: 'No boosts remaining', description: 'You have used all your boosts for this month.', variant: 'destructive' });
      return false;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase.from('creator_profile_boosts').insert({ influencer_id: user.id });
    if (error) {
      toast({ title: 'Boost failed', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Profile boosted!', description: 'You will appear at the top of search results for the next 24 hours.' });
    return true;
  };

  // Get remaining applications/pitches for current period
  const getRemainingApplications = async (): Promise<number | null> => {
    if (!subscriptionStatus?.plan) {
      return null;
    }
    
    // For supply-side users (creators), use pitches
    // For demand-side users, use applications
    const maxLimit = userTypeCategory === 'supply' 
      ? subscriptionStatus.plan.maxPitchesPerMonth 
      : subscriptionStatus.plan.maxApplicationsPerMonth;
    
    if (!maxLimit || maxLimit === -1) return null; // Unlimited
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const periodStart = subscriptionStatus.currentPeriodEnd 
        ? new Date(new Date(subscriptionStatus.currentPeriodEnd).getFullYear(), new Date(subscriptionStatus.currentPeriodEnd).getMonth(), 1)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
      const { data: applications, error } = await supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .eq('influencer_id', user.id)
        .gte('created_at', periodStart.toISOString());
      
      if (error) {
        console.error('Error fetching applications:', error);
        return null;
      }
      
      const usedApplications = applications?.length || 0;
      return Math.max(0, maxLimit - usedApplications);
    } catch (error) {
      console.error('Error getting remaining applications:', error);
      return null;
    }
  };

  useEffect(() => {
    checkUserType();
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    if (userType) {
      checkSubscriptionStatus();
    } else if (userTypeChecked) {
      // User type is null after check completed — set default free-tier status
      setSubscriptionStatus({
        hasActiveSubscription: false,
        subscriptionStatus: null,
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        billingInterval: null,
        isTrialing: false,
        hasPremiumOverride: false
      });
    }
  }, [userType, userTypeChecked]);

  // Self-healing refresh triggers: auth changes, tab focus, custom event, realtime DB updates
  useEffect(() => {
    const refresh = () => {
      if (userType) checkSubscriptionStatus();
    };

    const onAuth = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        checkUserType().then(refresh);
      }
    });

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onCustom = () => refresh();
    window.addEventListener('subscription:refresh', onCustom);

    // Realtime subscription updates (only when we have a user)
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase
        .channel(`subscriptions:${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'subscriptions', filter: `influencer_id=eq.${user.id}` },
          () => refresh()
        )
        .subscribe();
    })();

    return () => {
      onAuth.data.subscription.unsubscribe();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('subscription:refresh', onCustom);
      if (channel) supabase.removeChannel(channel);
    };
  }, [userType]);

  return {
    subscriptionStatus,
    subscriptionPlans,
    loading,
    statusLoading,
    actionLoading,
    isInfluencer,
    userType,
    userTypeCategory,
    checkSubscriptionStatus,
    createSubscription,
    manageSubscription,
    canApplyToProperties,
    getRemainingApplications,
    fetchSubscriptionPlans,
    hasFeature,
    isPaidPlan,
    isProPlan,
    isPremiumPlan,
    getRemainingBoostsThisMonth,
    activateProfileBoost,
    refetchSubscriptionStatus: checkSubscriptionStatus,
    refetch: () => {
      checkUserType();
      fetchSubscriptionPlans();
      checkSubscriptionStatus();
    }
  };
};
