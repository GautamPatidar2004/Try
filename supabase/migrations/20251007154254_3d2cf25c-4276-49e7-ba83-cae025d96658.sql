-- Create communication templates table
CREATE TABLE public.communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'notification', 'both')),
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create communication campaigns table
CREATE TABLE public.communication_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'notification', 'both')),
  subject TEXT,
  content TEXT NOT NULL,
  template_id UUID REFERENCES public.communication_templates(id),
  target_segment JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  total_recipients INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign recipients table
CREATE TABLE public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.communication_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

-- Enable RLS
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates
CREATE POLICY "Admins can manage all templates"
  ON public.communication_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for campaigns
CREATE POLICY "Admins can manage all campaigns"
  ON public.communication_campaigns
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for recipients
CREATE POLICY "Admins can view all recipients"
  ON public.campaign_recipients
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage recipients"
  ON public.campaign_recipients
  FOR ALL
  USING (true);

-- Create indexes
CREATE INDEX idx_campaign_recipients_campaign ON public.campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_user ON public.campaign_recipients(user_id);
CREATE INDEX idx_campaigns_status ON public.communication_campaigns(status);
CREATE INDEX idx_campaigns_scheduled ON public.communication_campaigns(scheduled_at);

-- Add triggers for updated_at
CREATE TRIGGER update_communication_templates_updated_at
  BEFORE UPDATE ON public.communication_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communication_campaigns_updated_at
  BEFORE UPDATE ON public.communication_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();