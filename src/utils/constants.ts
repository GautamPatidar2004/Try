/**
 * Application-wide constants
 */

// Property Types
export const PROPERTY_TYPES = [
  'Villa',
  'Apartment',
  'House',
  'Loft',
  'Cabin',
  'Condo',
  'Studio',
  'Hostel',
  'Hotel',
  'Resort'
] as const;

// Amenities
export const AMENITIES = [
  'WiFi',
  'Pool',
  'Parking',
  'Kitchen',
  'Washer',
  'Hot Tub',
  'Fireplace',
  'Beach Access',
  'Balcony',
  'Pet Friendly',
  'Gym',
  'Air Conditioning',
  'Heating',
  'Workspace'
] as const;

// Collaboration Types
export const COLLABORATION_TYPES = [
  'Free Stay',
  '50% Discount',
  '30% Discount',
  'Paid Collaboration',
  'Content Only',
  'Revenue Share'
] as const;

// Social Platforms
export const SOCIAL_PLATFORMS = [
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'facebook',
  'linkedin'
] as const;

// User Types
export const USER_TYPES = {
  HOST: 'host',
  INFLUENCER: 'influencer',
  BOTH: 'both'
} as const;

// Account Tiers
export const ACCOUNT_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
} as const;

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
} as const;

// Price Ranges
export const PRICE_RANGE = {
  MIN: 0,
  MAX: 1000,
  DEFAULT_MIN: 0,
  DEFAULT_MAX: 500,
  STEP: 10
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy HH:mm',
  FULL: 'PPP p'
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_BIO_LENGTH: 500,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_FOLLOWER_COUNT: 1000
} as const;
