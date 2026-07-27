-- Add social media URL fields to influencers table
ALTER TABLE public.influencers 
ADD COLUMN instagram_url text,
ADD COLUMN tiktok_url text,
ADD COLUMN youtube_url text,
ADD COLUMN twitter_url text;