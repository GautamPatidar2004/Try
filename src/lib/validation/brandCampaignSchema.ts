import { z } from 'zod';

export const brandCampaignSchema = z.object({
  // Campaign Basics
  campaign_title: z.string()
    .trim()
    .min(10, 'Campaign title must be at least 10 characters')
    .max(100, 'Campaign title must not exceed 100 characters'),
  campaign_description: z.string()
    .trim()
    .min(50, 'Campaign description must be at least 50 characters')
    .max(1000, 'Campaign description must not exceed 1000 characters'),
  campaign_brief_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  
  // Creator Requirements
  required_niches: z.array(z.string()).min(1, 'Select at least one niche'),
  required_platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  min_followers: z.number().min(0, 'Minimum followers must be positive'),
  max_followers: z.number().min(0, 'Maximum followers must be positive').optional(),
  min_engagement_rate: z.number().min(0).max(100).optional(),
  
  // Deliverables
  deliverables: z.array(z.string()).min(1, 'Select at least one deliverable'),
  content_requirements: z.array(z.string()).default([]),
  timeline_start: z.date().optional(),
  timeline_end: z.date().optional(),
  application_deadline: z.date().optional(),
  
  // Compensation
  compensation_type: z.enum(['paid', 'product', 'hybrid', 'affiliate'], {
    required_error: 'Select compensation type',
  }),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  product_value: z.number().min(0).optional(),
  currency: z.string().default('usd'),
  
  // Settings
  spots_available: z.number().min(1, 'At least 1 spot required').max(100, 'Maximum 100 spots'),
  visibility: z.enum(['public', 'private']).default('public'),
  expires_at: z.date().optional(),
  status: z.enum(['draft', 'open']).default('open'),
  
  // Campaign Image
  campaign_image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
}).refine(
  (data) => {
    if (!data.max_followers) return true;
    return data.min_followers <= data.max_followers;
  },
  {
    message: 'Maximum followers must be greater than minimum followers',
    path: ['max_followers'],
  }
).refine(
  (data) => {
    if (data.compensation_type === 'paid' || data.compensation_type === 'hybrid') {
      return data.budget_min !== undefined && data.budget_min > 0;
    }
    return true;
  },
  {
    message: 'Budget minimum is required for paid campaigns',
    path: ['budget_min'],
  }
);

export type BrandCampaignFormData = z.infer<typeof brandCampaignSchema>;
