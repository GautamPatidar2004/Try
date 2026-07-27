import { z } from 'zod';

// Collaboration Application Schema
export const collaborationApplicationSchema = z.object({
  proposal_message: z.string()
    .trim()
    .min(10, 'Proposal message must be at least 10 characters')
    .max(1000, 'Proposal message must not exceed 1000 characters'),
  proposed_dates_start: z.date({
    required_error: 'Start date is required'
  }),
  proposed_dates_end: z.date().optional(),
  content_deliverables: z.string()
    .trim()
    .max(500, 'Content deliverables must not exceed 500 characters')
    .optional()
});

// Content Post Schema
export const contentPostSchema = z.object({
  caption: z.string()
    .trim()
    .max(2200, 'Caption must not exceed 2200 characters') // Instagram limit
    .optional(),
  location: z.string()
    .trim()
    .max(100, 'Location must not exceed 100 characters')
    .optional(),
  hashtags: z.string()
    .trim()
    .max(500, 'Hashtags must not exceed 500 characters')
    .optional(),
  mentions: z.string()
    .trim()
    .max(500, 'Mentions must not exceed 500 characters')
    .optional(),
  media_type: z.enum(['image', 'video'], {
    required_error: 'Media type is required'
  }),
  media_url: z.string().url('Invalid media URL')
});

// Comment Schema
export const commentSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must not exceed 500 characters')
});

// Message Schema
export const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must not exceed 2000 characters')
});

// Onboarding Profile Schema
export const onboardingProfileSchema = z.object({
  first_name: z.string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  last_name: z.string()
    .trim()
    .max(50, 'Last name must not exceed 50 characters')
    .optional(),
  bio: z.string()
    .trim()
    .min(50, 'Bio must be at least 50 characters to show hosts who you are')
    .max(500, 'Bio must not exceed 500 characters'),
  location: z.string()
    .trim()
    .min(3, 'Location is required (e.g., Los Angeles, USA)')
    .max(100, 'Location must not exceed 100 characters'),
  profile_photo_url: z.string()
    .url('Profile picture is required')
    .min(1, 'Profile picture is required')
});

// Onboarding Social Schema
export const onboardingSocialSchema = z.object({
  instagram_url: z.string().trim().url('Invalid Instagram URL').optional().or(z.literal('')),
  youtube_url: z.string().trim().url('Invalid YouTube URL').optional().or(z.literal('')),
  twitter_url: z.string().trim().url('Invalid Twitter URL').optional().or(z.literal('')),
  instagram_followers: z.number().min(0, 'Follower count must be positive').optional(),
  youtube_followers: z.number().min(0, 'Follower count must be positive').optional(),
  twitter_followers: z.number().min(0, 'Follower count must be positive').optional(),
}).refine(
  (data) => {
    // At least one social account with follower count > 0
    return (
      (data.instagram_url && (data.instagram_followers || 0) > 0) ||
      (data.youtube_url && (data.youtube_followers || 0) > 0) ||
      (data.twitter_url && (data.twitter_followers || 0) > 0)
    );
  },
  {
    message: 'At least one social account with follower count is required'
  }
);

// Sanitize HTML content helper
export const sanitizeText = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
