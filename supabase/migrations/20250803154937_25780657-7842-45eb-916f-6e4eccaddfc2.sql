-- Phase 1: Database Schema Updates for Subscription Billing Model
-- Influencers pay subscriptions, hosts list for free, influencers earn from hosts/brands

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in cents
  price_yearly INTEGER, -- in cents, optional for yearly billing
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  max_applications_per_month INTEGER,
  max_brand_partnerships INTEGER,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table for influencers
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, incomplete
  billing_interval TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription usage tracking
CREATE TABLE public.subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  applications_count INTEGER DEFAULT 0,
  brand_partnerships_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, period_start)
);

-- Create payment methods table
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT NOT NULL, -- card, bank_account, etc.
  card_brand TEXT, -- visa, mastercard, etc.
  card_last4 TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create transactions table for all payments
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_id UUID NOT NULL,
  recipient_id UUID,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  type TEXT NOT NULL, -- subscription, collaboration, brand_partnership, payout
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  platform_fee INTEGER DEFAULT 0, -- in cents
  net_amount INTEGER, -- amount after platform fee
  related_id UUID, -- subscription_id, collaboration_id, brand_partnership_id, etc.
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id),
  stripe_invoice_id TEXT UNIQUE,
  invoice_number TEXT,
  amount_due INTEGER NOT NULL, -- in cents
  amount_paid INTEGER DEFAULT 0, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, open, paid, void, uncollectible
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  invoice_pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create collaboration rates table for influencer pricing
CREATE TABLE public.collaboration_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL,
  collaboration_type TEXT NOT NULL, -- free_stay, discount, paid
  rate_type TEXT NOT NULL, -- flat_fee, per_night, percentage
  base_rate INTEGER, -- in cents for flat_fee, percentage for percentage type
  minimum_rate INTEGER, -- minimum charge in cents
  maximum_rate INTEGER, -- maximum charge in cents
  currency TEXT DEFAULT 'usd',
  property_types TEXT[] DEFAULT '{}', -- specific property types this rate applies to
  seasonal_multiplier DECIMAL(3,2) DEFAULT 1.0,
  weekend_multiplier DECIMAL(3,2) DEFAULT 1.0,
  is_negotiable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create brand partnerships table
CREATE TABLE public.brand_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  brand_contact_email TEXT NOT NULL,
  brand_contact_name TEXT,
  influencer_id UUID NOT NULL,
  campaign_title TEXT NOT NULL,
  campaign_description TEXT,
  content_requirements TEXT[],
  deliverables TEXT[],
  timeline_start DATE,
  timeline_end DATE,
  total_amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  payment_terms TEXT, -- upfront, milestone, completion
  status TEXT DEFAULT 'pending', -- pending, active, completed, canceled
  contract_signed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create earnings table to track influencer income
CREATE TABLE public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL,
  source_type TEXT NOT NULL, -- collaboration, brand_partnership
  source_id UUID NOT NULL, -- application_id or brand_partnership_id
  gross_amount INTEGER NOT NULL, -- in cents
  platform_fee INTEGER DEFAULT 0, -- in cents
  net_amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending', -- pending, available, paid_out
  earned_at TIMESTAMPTZ NOT NULL,
  available_at TIMESTAMPTZ, -- when funds become available for payout
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payouts table for influencer withdrawals
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  payout_method TEXT NOT NULL, -- bank_transfer, paypal, stripe_express
  stripe_payout_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_transit, paid, failed, canceled
  failure_reason TEXT,
  arrival_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create collaboration agreements table
CREATE TABLE public.collaboration_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id),
  host_id UUID NOT NULL,
  influencer_id UUID NOT NULL,
  agreed_rate INTEGER, -- in cents, if paid collaboration
  currency TEXT DEFAULT 'usd',
  payment_terms TEXT, -- upfront, completion, milestone
  content_requirements TEXT[],
  deliverable_count INTEGER DEFAULT 1,
  deadline DATE,
  cancellation_policy TEXT,
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  host_signed_at TIMESTAMPTZ,
  influencer_signed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, active, completed, canceled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content deliveries table
CREATE TABLE public.content_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.collaboration_agreements(id),
  content_post_id UUID REFERENCES public.content_posts(id),
  delivery_type TEXT NOT NULL, -- instagram_post, instagram_story, tiktok, youtube, blog
  content_url TEXT,
  engagement_metrics JSONB DEFAULT '{}'::jsonb,
  delivered_at TIMESTAMPTZ,
  approved_by_host_at TIMESTAMPTZ,
  payment_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reviews and ratings table for paid collaborations
CREATE TABLE public.reviews_and_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.collaboration_agreements(id),
  reviewer_id UUID NOT NULL, -- host or influencer
  reviewee_id UUID NOT NULL, -- host or influencer
  reviewer_type TEXT NOT NULL, -- host, influencer
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  would_work_again BOOLEAN,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agreement_id, reviewer_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews_and_ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Subscription plans - publicly viewable, admin manageable
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Subscriptions - influencers can view/manage their own
CREATE POLICY "Influencers can view their own subscriptions" ON public.subscriptions
FOR SELECT USING (auth.uid() = influencer_id);

CREATE POLICY "Influencers can insert their own subscriptions" ON public.subscriptions
FOR INSERT WITH CHECK (auth.uid() = influencer_id);

CREATE POLICY "Influencers can update their own subscriptions" ON public.subscriptions
FOR UPDATE USING (auth.uid() = influencer_id);

CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Subscription usage - influencers can view their own
CREATE POLICY "Influencers can view their own subscription usage" ON public.subscription_usage
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.subscriptions s 
    WHERE s.id = subscription_usage.subscription_id 
    AND s.influencer_id = auth.uid()
  )
);

CREATE POLICY "System can manage subscription usage" ON public.subscription_usage
FOR ALL USING (true);

-- Payment methods - users can manage their own
CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
FOR ALL USING (auth.uid() = user_id);

-- Transactions - users can view transactions they're involved in
CREATE POLICY "Users can view their own transactions" ON public.transactions
FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = recipient_id);

CREATE POLICY "System can manage transactions" ON public.transactions
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update transactions" ON public.transactions
FOR UPDATE USING (true);

-- Invoices - users can view their own invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage invoices" ON public.invoices
FOR ALL USING (true);

-- Collaboration rates - influencers can manage their own rates
CREATE POLICY "Influencers can manage their own rates" ON public.collaboration_rates
FOR ALL USING (auth.uid() = influencer_id);

CREATE POLICY "Anyone can view active rates" ON public.collaboration_rates
FOR SELECT USING (is_active = true);

-- Brand partnerships - influencers can manage their own
CREATE POLICY "Influencers can manage their own brand partnerships" ON public.brand_partnerships
FOR ALL USING (auth.uid() = influencer_id);

-- Earnings - influencers can view their own earnings
CREATE POLICY "Influencers can view their own earnings" ON public.earnings
FOR SELECT USING (auth.uid() = influencer_id);

CREATE POLICY "System can manage earnings" ON public.earnings
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update earnings" ON public.earnings
FOR UPDATE USING (true);

-- Payouts - influencers can manage their own payouts
CREATE POLICY "Influencers can manage their own payouts" ON public.payouts
FOR ALL USING (auth.uid() = influencer_id);

-- Collaboration agreements - involved parties can view/manage
CREATE POLICY "Involved parties can view collaboration agreements" ON public.collaboration_agreements
FOR SELECT USING (auth.uid() = host_id OR auth.uid() = influencer_id);

CREATE POLICY "Involved parties can update collaboration agreements" ON public.collaboration_agreements
FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = influencer_id);

CREATE POLICY "System can create collaboration agreements" ON public.collaboration_agreements
FOR INSERT WITH CHECK (true);

-- Content deliveries - involved parties can view/manage
CREATE POLICY "Involved parties can view content deliveries" ON public.content_deliveries
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.collaboration_agreements ca 
    WHERE ca.id = content_deliveries.agreement_id 
    AND (ca.host_id = auth.uid() OR ca.influencer_id = auth.uid())
  )
);

CREATE POLICY "Influencers can manage content deliveries" ON public.content_deliveries
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.collaboration_agreements ca 
    WHERE ca.id = content_deliveries.agreement_id 
    AND ca.influencer_id = auth.uid()
  )
);

-- Reviews and ratings - involved parties can view, reviewers can create
CREATE POLICY "Involved parties can view reviews" ON public.reviews_and_ratings
FOR SELECT USING (
  auth.uid() = reviewer_id OR auth.uid() = reviewee_id OR
  EXISTS (
    SELECT 1 FROM public.collaboration_agreements ca 
    WHERE ca.id = reviews_and_ratings.agreement_id 
    AND (ca.host_id = auth.uid() OR ca.influencer_id = auth.uid())
  )
);

CREATE POLICY "Involved parties can create reviews" ON public.reviews_and_ratings
FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM public.collaboration_agreements ca 
    WHERE ca.id = reviews_and_ratings.agreement_id 
    AND (ca.host_id = auth.uid() OR ca.influencer_id = auth.uid())
  )
);

-- Create database functions

-- Function to check if an influencer has an active subscription
CREATE OR REPLACE FUNCTION public.check_subscription_status(influencer_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.influencer_id = influencer_user_id
      AND s.status = 'active'
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
  );
$$;

-- Function to calculate platform fee based on transaction amount
CREATE OR REPLACE FUNCTION public.calculate_platform_fee(amount INTEGER, transaction_type TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  fee_percentage DECIMAL := 0.10; -- 10% default platform fee
BEGIN
  -- Different fee structures based on transaction type
  CASE transaction_type
    WHEN 'collaboration' THEN
      fee_percentage := 0.10; -- 10% for host-influencer collaborations
    WHEN 'brand_partnership' THEN
      fee_percentage := 0.15; -- 15% for brand partnerships
    ELSE
      fee_percentage := 0.10;
  END CASE;
  
  RETURN (amount * fee_percentage)::INTEGER;
END;
$$;

-- Function to update earnings when payments are processed
CREATE OR REPLACE FUNCTION public.update_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  platform_fee INTEGER;
  net_amount INTEGER;
BEGIN
  -- Only process completed transactions
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Calculate platform fee
    platform_fee := public.calculate_platform_fee(NEW.amount, NEW.type);
    net_amount := NEW.amount - platform_fee;
    
    -- Update transaction with calculated fees
    UPDATE public.transactions 
    SET platform_fee = platform_fee,
        net_amount = net_amount,
        updated_at = now()
    WHERE id = NEW.id;
    
    -- Create earnings record for recipient
    IF NEW.recipient_id IS NOT NULL AND NEW.type IN ('collaboration', 'brand_partnership') THEN
      INSERT INTO public.earnings (
        influencer_id,
        source_type,
        source_id,
        gross_amount,
        platform_fee,
        net_amount,
        currency,
        status,
        earned_at,
        available_at
      ) VALUES (
        NEW.recipient_id,
        NEW.type,
        NEW.related_id,
        NEW.amount,
        platform_fee,
        net_amount,
        NEW.currency,
        'available',
        NEW.processed_at,
        NEW.processed_at + INTERVAL '7 days' -- 7 day hold period
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic earnings updates
CREATE TRIGGER update_earnings_on_payment
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_earnings();

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON public.subscription_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collaboration_rates_updated_at BEFORE UPDATE ON public.collaboration_rates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brand_partnerships_updated_at BEFORE UPDATE ON public.brand_partnerships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_earnings_updated_at BEFORE UPDATE ON public.earnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collaboration_agreements_updated_at BEFORE UPDATE ON public.collaboration_agreements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_deliveries_updated_at BEFORE UPDATE ON public.content_deliveries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_and_ratings_updated_at BEFORE UPDATE ON public.reviews_and_ratings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features, max_applications_per_month, max_brand_partnerships, display_order) VALUES
('Basic', 'Essential features for growing influencers', 2999, 29990, '["Apply to up to 10 properties per month", "Basic analytics", "Email support", "Profile verification"]', 10, 2, 1),
('Premium', 'Advanced features for established influencers', 4999, 49990, '["Apply to up to 25 properties per month", "Advanced analytics", "Priority support", "Custom rates", "Brand partnership marketplace", "Revenue tracking"]', 25, 5, 2),
('Enterprise', 'Complete solution for top influencers', 9999, 99990, '["Unlimited property applications", "White-label content", "Dedicated account manager", "Custom contracts", "Advanced reporting", "Early access to new features"]', -1, -1, 3);