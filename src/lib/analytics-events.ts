/**
 * Product Analytics Event Taxonomy
 * 
 * This file defines all tracked events in the platform.
 * Events are categorized by type and have documented parameters.
 */

// Event name constants
export const ANALYTICS_EVENTS = {
  // Engagement events
  MARKETING_CTA_CLICK: 'marketing_cta_click',
  MARKETPLACE_FILTER_CHANGE: 'marketplace_filter_change',
  CREATOR_PROFILE_VIEW: 'creator_profile_view',
  
  // Acquisition events
  SIGNUP_START: 'signup_start',
  SIGNUP_COMPLETE: 'signup_complete',
  
  // Conversion events
  INVITE_SENT: 'invite_sent',
  INVITE_ACCEPTED: 'invite_accepted',
  INVITE_DECLINED: 'invite_declined',
  INVITE_COUNTERED: 'invite_countered',
  
  // Fulfillment events
  ASSETS_DELIVERED: 'assets_delivered',
  
  // Monetization events
  SUBSCRIPTION_STARTED: 'subscription_started',
} as const;

// Event type categories
export const EVENT_TYPES = {
  ENGAGEMENT: 'engagement',
  ACQUISITION: 'acquisition',
  CONVERSION: 'conversion',
  FULFILLMENT: 'fulfillment',
  MONETIZATION: 'monetization',
} as const;

// Type definitions for event parameters
export type EventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];
export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

/**
 * Marketing CTA click event parameters
 * Tracks when users click on marketing call-to-action buttons
 */
export interface MarketingCtaClickParams {
  /** Name of the CTA button clicked */
  cta_name: string;
  /** Page where the CTA was clicked */
  page: string;
}

/**
 * Signup event parameters
 * Tracks signup flow initiation and completion
 */
export interface SignupParams {
  /** User role being signed up for */
  role: 'host' | 'influencer' | 'brand' | 'restaurant_owner';
}

/**
 * Marketplace filter change event parameters
 * Tracks when users adjust marketplace filters
 */
export interface MarketplaceFilterChangeParams {
  /** Name of the filter that was changed */
  filter_name: string;
  /** New value of the filter */
  value: string;
}

/**
 * Creator profile view event parameters
 * Tracks when users view a creator's profile
 */
export interface CreatorProfileViewParams {
  /** ID of the creator whose profile was viewed */
  creator_id: string;
}

/**
 * Invite sent event parameters
 * Tracks when hosts send collaboration invites
 */
export interface InviteSentParams {
  /** ID of the creator being invited */
  creator_id: string;
  /** Type of offer (e.g., commission rate) */
  offer_type: string;
}

/**
 * Invite response event parameters
 * Tracks when creators respond to invites
 */
export interface InviteResponseParams {
  /** ID of the application being responded to */
  application_id: string;
}

/**
 * Assets delivered event parameters
 * Tracks when content is delivered for a collaboration
 */
export interface AssetsDeliveredParams {
  /** ID of the collaboration */
  collaboration_id: string;
  /** Number of assets delivered */
  asset_count: number;
}

/**
 * Subscription started event parameters
 * Tracks when users start a subscription
 */
export interface SubscriptionStartedParams {
  /** Subscription plan name */
  plan: string;
  /** Billing interval (monthly, yearly) */
  billing_interval?: 'monthly' | 'yearly';
}

// Map events to their types for easy lookup
export const EVENT_TYPE_MAP: Record<EventName, EventType> = {
  [ANALYTICS_EVENTS.MARKETING_CTA_CLICK]: EVENT_TYPES.ENGAGEMENT,
  [ANALYTICS_EVENTS.MARKETPLACE_FILTER_CHANGE]: EVENT_TYPES.ENGAGEMENT,
  [ANALYTICS_EVENTS.CREATOR_PROFILE_VIEW]: EVENT_TYPES.ENGAGEMENT,
  [ANALYTICS_EVENTS.SIGNUP_START]: EVENT_TYPES.ACQUISITION,
  [ANALYTICS_EVENTS.SIGNUP_COMPLETE]: EVENT_TYPES.ACQUISITION,
  [ANALYTICS_EVENTS.INVITE_SENT]: EVENT_TYPES.CONVERSION,
  [ANALYTICS_EVENTS.INVITE_ACCEPTED]: EVENT_TYPES.CONVERSION,
  [ANALYTICS_EVENTS.INVITE_DECLINED]: EVENT_TYPES.CONVERSION,
  [ANALYTICS_EVENTS.INVITE_COUNTERED]: EVENT_TYPES.CONVERSION,
  [ANALYTICS_EVENTS.ASSETS_DELIVERED]: EVENT_TYPES.FULFILLMENT,
  [ANALYTICS_EVENTS.SUBSCRIPTION_STARTED]: EVENT_TYPES.MONETIZATION,
};
