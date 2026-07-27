ALTER TABLE public.media_kits 
ADD COLUMN IF NOT EXISTS builder_config jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';