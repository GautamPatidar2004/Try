ALTER TABLE public.influencers
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS lifestyle_tags text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.influencers
  DROP CONSTRAINT IF EXISTS influencers_gender_check;
ALTER TABLE public.influencers
  ADD CONSTRAINT influencers_gender_check
  CHECK (gender IS NULL OR gender IN ('male','female','non_binary','prefer_not_to_say'));

CREATE INDEX IF NOT EXISTS influencers_lifestyle_tags_idx
  ON public.influencers USING GIN (lifestyle_tags);
CREATE INDEX IF NOT EXISTS influencers_date_of_birth_idx
  ON public.influencers (date_of_birth);
CREATE INDEX IF NOT EXISTS influencers_gender_idx
  ON public.influencers (gender);