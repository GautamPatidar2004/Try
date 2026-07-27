-- Brand campaign affiliate tracking system
-- Per-creator trackable URL slugs for brand campaigns

-- 1. Links table (one per campaign+creator)
CREATE TABLE public.brand_campaign_affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.brand_campaigns(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  destination_url text NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 0,
  clicks_count integer NOT NULL DEFAULT 0,
  conversions_count integer NOT NULL DEFAULT 0,
  total_revenue_cents integer NOT NULL DEFAULT 0,
  total_commission_cents integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, creator_id)
);

CREATE INDEX idx_bcal_creator ON public.brand_campaign_affiliate_links(creator_id);
CREATE INDEX idx_bcal_campaign ON public.brand_campaign_affiliate_links(campaign_id);
CREATE INDEX idx_bcal_slug ON public.brand_campaign_affiliate_links(slug);

-- 2. Click log
CREATE TABLE public.brand_campaign_affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.brand_campaign_affiliate_links(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.brand_campaigns(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_agent text,
  referrer_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  device_type text,
  country text,
  converted boolean NOT NULL DEFAULT false,
  converted_user_id uuid,
  converted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bcac_link ON public.brand_campaign_affiliate_clicks(link_id);
CREATE INDEX idx_bcac_creator ON public.brand_campaign_affiliate_clicks(creator_id);
CREATE INDEX idx_bcac_clicked ON public.brand_campaign_affiliate_clicks(clicked_at DESC);

-- 3. Conversions
CREATE TABLE public.brand_campaign_affiliate_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.brand_campaign_affiliate_links(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.brand_campaigns(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  click_id uuid REFERENCES public.brand_campaign_affiliate_clicks(id) ON DELETE SET NULL,
  order_amount_cents integer NOT NULL,
  commission_amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  external_reference text,
  customer_email_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  converted_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bcacv_link ON public.brand_campaign_affiliate_conversions(link_id);
CREATE INDEX idx_bcacv_creator ON public.brand_campaign_affiliate_conversions(creator_id);
CREATE INDEX idx_bcacv_campaign ON public.brand_campaign_affiliate_conversions(campaign_id);

-- 4. Slug generator
CREATE OR REPLACE FUNCTION public.generate_brand_affiliate_slug(p_brand_name text, p_creator_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_brand text;
  v_creator text;
  v_slug text;
  v_random text;
  v_exists boolean;
  v_attempts int := 0;
BEGIN
  v_brand := UPPER(REGEXP_REPLACE(LEFT(COALESCE(p_brand_name, 'BRAND'), 4), '[^A-Za-z0-9]', '', 'g'));
  v_creator := UPPER(REGEXP_REPLACE(LEFT(COALESCE(p_creator_name, 'USER'), 4), '[^A-Za-z0-9]', '', 'g'));
  IF length(v_brand) = 0 THEN v_brand := 'BRND'; END IF;
  IF length(v_creator) = 0 THEN v_creator := 'USER'; END IF;

  LOOP
    v_random := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 4));
    v_slug := v_brand || '-' || v_creator || '-' || v_random;
    SELECT EXISTS(SELECT 1 FROM public.brand_campaign_affiliate_links WHERE slug = v_slug) INTO v_exists;
    EXIT WHEN NOT v_exists;
    v_attempts := v_attempts + 1;
    IF v_attempts > 50 THEN
      v_slug := 'AFF-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 10));
      EXIT;
    END IF;
  END LOOP;

  RETURN v_slug;
END;
$$;

-- 5. Counter triggers
CREATE OR REPLACE FUNCTION public.bcal_increment_clicks()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.brand_campaign_affiliate_links
    SET clicks_count = clicks_count + 1, updated_at = now()
    WHERE id = NEW.link_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_bcac_increment AFTER INSERT ON public.brand_campaign_affiliate_clicks
  FOR EACH ROW EXECUTE FUNCTION public.bcal_increment_clicks();

CREATE OR REPLACE FUNCTION public.bcal_increment_conversions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.brand_campaign_affiliate_links
    SET conversions_count = conversions_count + 1,
        total_revenue_cents = total_revenue_cents + NEW.order_amount_cents,
        total_commission_cents = total_commission_cents + NEW.commission_amount_cents,
        updated_at = now()
    WHERE id = NEW.link_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_bcacv_increment AFTER INSERT ON public.brand_campaign_affiliate_conversions
  FOR EACH ROW EXECUTE FUNCTION public.bcal_increment_conversions();

CREATE TRIGGER trg_bcal_updated_at BEFORE UPDATE ON public.brand_campaign_affiliate_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bcacv_updated_at BEFORE UPDATE ON public.brand_campaign_affiliate_conversions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. RLS
ALTER TABLE public.brand_campaign_affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_campaign_affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_campaign_affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Links: creator reads own, brand owner reads campaign's, admin all
CREATE POLICY "Creators view own affiliate links" ON public.brand_campaign_affiliate_links
  FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Brand owners view their campaign links" ON public.brand_campaign_affiliate_links
  FOR SELECT USING (EXISTS (SELECT 1 FROM brand_campaigns bc WHERE bc.id = campaign_id AND bc.created_by = auth.uid()));
CREATE POLICY "Admins manage affiliate links" ON public.brand_campaign_affiliate_links
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public lookup by slug for redirect" ON public.brand_campaign_affiliate_links
  FOR SELECT TO anon, authenticated USING (is_active = true);

-- Clicks: creator reads own, brand owner reads campaign's, admin all; inserts via edge function only
CREATE POLICY "Creators view own clicks" ON public.brand_campaign_affiliate_clicks
  FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Brand owners view their campaign clicks" ON public.brand_campaign_affiliate_clicks
  FOR SELECT USING (EXISTS (SELECT 1 FROM brand_campaigns bc WHERE bc.id = campaign_id AND bc.created_by = auth.uid()));
CREATE POLICY "Admins manage clicks" ON public.brand_campaign_affiliate_clicks
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Conversions: same pattern
CREATE POLICY "Creators view own conversions" ON public.brand_campaign_affiliate_conversions
  FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Brand owners view their campaign conversions" ON public.brand_campaign_affiliate_conversions
  FOR SELECT USING (EXISTS (SELECT 1 FROM brand_campaigns bc WHERE bc.id = campaign_id AND bc.created_by = auth.uid()));
CREATE POLICY "Admins manage conversions" ON public.brand_campaign_affiliate_conversions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
