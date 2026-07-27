-- Create Meta Ad Accounts table
CREATE TABLE public.meta_ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  ad_account_id TEXT NOT NULL,
  ad_account_name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  timezone TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(host_id, ad_account_id)
);

-- Create Meta Ad Campaigns table
CREATE TABLE public.meta_ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  ad_account_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL UNIQUE,
  campaign_name TEXT NOT NULL,
  objective TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  daily_budget INTEGER,
  lifetime_budget INTEGER,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Meta Ad Sets table
CREATE TABLE public.meta_ad_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.meta_ad_campaigns(id) ON DELETE CASCADE,
  ad_set_id TEXT NOT NULL UNIQUE,
  ad_set_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  targeting JSONB DEFAULT '{}'::jsonb,
  placement JSONB DEFAULT '{}'::jsonb,
  bid_amount INTEGER,
  daily_budget INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Meta Ad Creatives table
CREATE TABLE public.meta_ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_set_id UUID NOT NULL REFERENCES public.meta_ad_sets(id) ON DELETE CASCADE,
  ad_id TEXT NOT NULL UNIQUE,
  ad_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  creative_type TEXT NOT NULL,
  headline TEXT,
  description TEXT,
  call_to_action TEXT,
  link_url TEXT,
  image_url TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Meta Ad Insights table
CREATE TABLE public.meta_ad_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.meta_ad_campaigns(id) ON DELETE CASCADE,
  ad_set_id UUID REFERENCES public.meta_ad_sets(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES public.meta_ad_creatives(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  ctr NUMERIC(5,2),
  cpc INTEGER,
  cpm INTEGER,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, ad_set_id, ad_id, date)
);

-- Enable RLS
ALTER TABLE public.meta_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ad_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meta_ad_accounts
CREATE POLICY "Hosts can manage their ad accounts"
ON public.meta_ad_accounts FOR ALL
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

-- RLS Policies for meta_ad_campaigns
CREATE POLICY "Hosts can manage their campaigns"
ON public.meta_ad_campaigns FOR ALL
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

-- RLS Policies for meta_ad_sets
CREATE POLICY "Hosts can manage their ad sets"
ON public.meta_ad_sets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.meta_ad_campaigns
    WHERE meta_ad_campaigns.id = meta_ad_sets.campaign_id
    AND meta_ad_campaigns.host_id = auth.uid()
  )
);

-- RLS Policies for meta_ad_creatives
CREATE POLICY "Hosts can manage their ad creatives"
ON public.meta_ad_creatives FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.meta_ad_sets
    JOIN public.meta_ad_campaigns ON meta_ad_campaigns.id = meta_ad_sets.campaign_id
    WHERE meta_ad_sets.id = meta_ad_creatives.ad_set_id
    AND meta_ad_campaigns.host_id = auth.uid()
  )
);

-- RLS Policies for meta_ad_insights
CREATE POLICY "Hosts can view their ad insights"
ON public.meta_ad_insights FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.meta_ad_campaigns
    WHERE meta_ad_campaigns.id = meta_ad_insights.campaign_id
    AND meta_ad_campaigns.host_id = auth.uid()
  )
);

CREATE POLICY "System can insert ad insights"
ON public.meta_ad_insights FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_meta_ad_accounts_host_id ON public.meta_ad_accounts(host_id);
CREATE INDEX idx_meta_ad_campaigns_host_id ON public.meta_ad_campaigns(host_id);
CREATE INDEX idx_meta_ad_campaigns_property_id ON public.meta_ad_campaigns(property_id);
CREATE INDEX idx_meta_ad_sets_campaign_id ON public.meta_ad_sets(campaign_id);
CREATE INDEX idx_meta_ad_creatives_ad_set_id ON public.meta_ad_creatives(ad_set_id);
CREATE INDEX idx_meta_ad_insights_campaign_id ON public.meta_ad_insights(campaign_id);
CREATE INDEX idx_meta_ad_insights_date ON public.meta_ad_insights(date);