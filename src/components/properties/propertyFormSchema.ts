import { z } from "zod";

export const propertyFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  property_type: z.string().min(1, "Property type is required"),
  max_guests: z.number().min(1, "At least 1 guest required").max(20, "Maximum 20 guests"),
  bedrooms: z.number().min(0, "Bedrooms cannot be negative").max(20, "Maximum 20 bedrooms"),
  bathrooms: z.number().min(0, "Bathrooms cannot be negative").max(20, "Maximum 20 bathrooms"),
  amenities: z.array(z.string()).default([]),
  content_requirements: z.array(z.string()).default([]),
  currency: z.string().default('USD'),
  campaign_rate: z.number().min(25000, "Campaign rate must be at least $250"),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;

export const PROPERTY_TYPES = [
  "house",
  "apartment",
  "villa",
  "condo",
  "cabin",
  "cottage",
  "loft",
  "studio",
  "townhouse",
  "other"
];

export const AMENITIES_OPTIONS = [
  "WiFi",
  "Kitchen",
  "Parking",
  "Pool",
  "Gym",
  "Air Conditioning",
  "Heating",
  "Hot Tub",
  "Balcony",
  "Garden",
  "Beach Access",
  "Pet Friendly",
  "Wheelchair Accessible",
  "Laundry",
  "TV",
  "Fireplace",
];

export const CONTENT_REQUIREMENTS = [
  "Instagram Posts",
  "Instagram Stories",
  "Instagram Reels",
  "TikTok Videos",
  "YouTube Videos",
  "Blog Posts",
  "Reviews",
  "Social Media Mentions",
  "Website Features",
  "Photography",
];
