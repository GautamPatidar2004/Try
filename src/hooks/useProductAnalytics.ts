import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  ANALYTICS_EVENTS,
  EVENT_TYPES,
  EVENT_TYPE_MAP,
  type EventName,
  type MarketingCtaClickParams,
  type SignupParams,
  type MarketplaceFilterChangeParams,
  type CreatorProfileViewParams,
  type InviteSentParams,
  type InviteResponseParams,
  type AssetsDeliveredParams,
  type SubscriptionStartedParams,
} from '@/lib/analytics-events';

// Session-based deduplication for profile views
const viewedCreators = new Set<string>();

// Debounce timers for filter changes
const filterDebounceTimers: Record<string, NodeJS.Timeout> = {};

/**
 * Centralized product analytics tracking hook
 * Ensures events fire exactly once per action with consistent parameters
 */
export const useProductAnalytics = () => {
  const lastTrackedRef = useRef<Record<string, number>>({});

  /**
   * Core event tracking function
   * Inserts event into analytics_events table with context metadata
   */
  const trackEvent = useCallback(async (
    eventName: EventName,
    metadata: Record<string, any>
  ) => {
    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get event type from mapping
      const eventType = EVENT_TYPE_MAP[eventName];
      
      // Insert into analytics_events table
      await supabase.from('analytics_events').insert({
        user_id: user?.id || null,
        event_type: eventType,
        event_name: eventName,
        metadata: {
          ...metadata,
          page_path: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Silently fail to not disrupt user experience
      console.error('Analytics tracking error:', error);
    }
  }, []);

  /**
   * Track marketing CTA clicks
   * Fires immediately on click
   */
  const trackMarketingCta = useCallback((params: MarketingCtaClickParams) => {
    trackEvent(ANALYTICS_EVENTS.MARKETING_CTA_CLICK, params);
  }, [trackEvent]);

  /**
   * Track signup flow start
   * Fires when user selects signup tab or starts signup
   */
  const trackSignupStart = useCallback((params: SignupParams) => {
    // Deduplicate within 5 seconds
    const key = `signup_start_${params.role}`;
    const now = Date.now();
    if (lastTrackedRef.current[key] && now - lastTrackedRef.current[key] < 5000) {
      return;
    }
    lastTrackedRef.current[key] = now;
    trackEvent(ANALYTICS_EVENTS.SIGNUP_START, params);
  }, [trackEvent]);

  /**
   * Track signup completion
   * Fires after successful signup
   */
  const trackSignupComplete = useCallback((params: SignupParams) => {
    trackEvent(ANALYTICS_EVENTS.SIGNUP_COMPLETE, params);
  }, [trackEvent]);

  /**
   * Track marketplace filter changes
   * Debounced to 500ms to avoid spam on rapid adjustments
   */
  const trackMarketplaceFilterChange = useCallback((params: MarketplaceFilterChangeParams) => {
    const key = `filter_${params.filter_name}`;
    
    // Clear existing timer for this filter
    if (filterDebounceTimers[key]) {
      clearTimeout(filterDebounceTimers[key]);
    }
    
    // Set new debounced timer
    filterDebounceTimers[key] = setTimeout(() => {
      trackEvent(ANALYTICS_EVENTS.MARKETPLACE_FILTER_CHANGE, params);
      delete filterDebounceTimers[key];
    }, 500);
  }, [trackEvent]);

  /**
   * Track creator profile views
   * Deduplicated per session per creator
   */
  const trackCreatorProfileView = useCallback((params: CreatorProfileViewParams) => {
    // Only track once per session per creator
    if (viewedCreators.has(params.creator_id)) {
      return;
    }
    viewedCreators.add(params.creator_id);
    trackEvent(ANALYTICS_EVENTS.CREATOR_PROFILE_VIEW, params);
  }, [trackEvent]);

  /**
   * Track invite sent to creator
   */
  const trackInviteSent = useCallback((params: InviteSentParams) => {
    trackEvent(ANALYTICS_EVENTS.INVITE_SENT, params);
  }, [trackEvent]);

  /**
   * Track invite accepted
   */
  const trackInviteAccepted = useCallback((params: InviteResponseParams) => {
    trackEvent(ANALYTICS_EVENTS.INVITE_ACCEPTED, params);
  }, [trackEvent]);

  /**
   * Track invite declined
   */
  const trackInviteDeclined = useCallback((params: InviteResponseParams) => {
    trackEvent(ANALYTICS_EVENTS.INVITE_DECLINED, params);
  }, [trackEvent]);

  /**
   * Track invite countered
   */
  const trackInviteCountered = useCallback((params: InviteResponseParams) => {
    trackEvent(ANALYTICS_EVENTS.INVITE_COUNTERED, params);
  }, [trackEvent]);

  /**
   * Track assets/content delivered
   */
  const trackAssetsDelivered = useCallback((params: AssetsDeliveredParams) => {
    trackEvent(ANALYTICS_EVENTS.ASSETS_DELIVERED, params);
  }, [trackEvent]);

  /**
   * Track subscription started
   */
  const trackSubscriptionStarted = useCallback((params: SubscriptionStartedParams) => {
    trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_STARTED, params);
  }, [trackEvent]);

  return {
    trackMarketingCta,
    trackSignupStart,
    trackSignupComplete,
    trackMarketplaceFilterChange,
    trackCreatorProfileView,
    trackInviteSent,
    trackInviteAccepted,
    trackInviteDeclined,
    trackInviteCountered,
    trackAssetsDelivered,
    trackSubscriptionStarted,
  };
};
