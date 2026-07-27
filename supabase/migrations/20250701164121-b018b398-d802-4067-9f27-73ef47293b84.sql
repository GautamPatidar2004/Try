-- Create support categories table
CREATE TABLE public.support_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create FAQ table
CREATE TABLE public.faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id UUID REFERENCES public.support_categories(id),
  search_keywords TEXT[],
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.support_categories(id),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_admin_id UUID,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create support ticket messages table for conversation thread
CREATE TABLE public.support_ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT false,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_categories
CREATE POLICY "Anyone can view active support categories" 
ON public.support_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage support categories" 
ON public.support_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for faq
CREATE POLICY "Anyone can view active FAQ" 
ON public.faq 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage FAQ" 
ON public.faq 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for support_tickets
CREATE POLICY "Users can create their own support tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own support tickets" 
ON public.support_tickets 
FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own support tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all support tickets" 
ON public.support_tickets 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for support_ticket_messages
CREATE POLICY "Users can create messages for their tickets" 
ON public.support_ticket_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE id = ticket_id AND 
    (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can view messages for their tickets" 
ON public.support_ticket_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE id = ticket_id AND 
    (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Create indexes for better performance
CREATE INDEX idx_faq_category_id ON public.faq(category_id);
CREATE INDEX idx_faq_search_keywords ON public.faq USING GIN(search_keywords);
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_category_id ON public.support_tickets(category_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);

-- Insert default support categories
INSERT INTO public.support_categories (name, description, icon, display_order) VALUES
('Account Issues', 'Problems with login, registration, or account settings', 'user', 1),
('Payment & Billing', 'Questions about payments, billing, or subscriptions', 'credit-card', 2),
('Technical Support', 'Website bugs, performance issues, or technical problems', 'settings', 3),
('Host Questions', 'Questions specific to hosts and property listings', 'home', 4),
('Influencer Questions', 'Questions specific to influencers and collaborations', 'users', 5),
('General Support', 'Other questions or feedback', 'help-circle', 6);

-- Insert sample FAQ items
INSERT INTO public.faq (question, answer, category_id, search_keywords, display_order) VALUES
(
  'How do I create an account?',
  'To create an account, click the "Sign Up" button in the top right corner of the homepage. You can sign up using your email address or social media accounts.',
  (SELECT id FROM public.support_categories WHERE name = 'Account Issues'),
  ARRAY['signup', 'register', 'account', 'create'],
  1
),
(
  'How do I reset my password?',
  'Click on "Forgot Password" on the login page and enter your email address. You will receive a password reset link in your email.',
  (SELECT id FROM public.support_categories WHERE name = 'Account Issues'),
  ARRAY['password', 'reset', 'forgot', 'login'],
  2
),
(
  'How do I list my property?',
  'Once you have a host account, go to your profile and click "Add Property". Fill out the property details, upload photos, and set your collaboration preferences.',
  (SELECT id FROM public.support_categories WHERE name = 'Host Questions'),
  ARRAY['property', 'listing', 'host', 'add'],
  1
),
(
  'How do collaborations work?',
  'Influencers browse available properties and apply for collaborations. Hosts review applications and approve partnerships. Both parties agree on content deliverables and stay dates.',
  (SELECT id FROM public.support_categories WHERE name = 'General Support'),
  ARRAY['collaboration', 'partnership', 'how it works', 'process'],
  1
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_support_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_support_categories_updated_at
  BEFORE UPDATE ON public.support_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_updated_at_column();

CREATE TRIGGER update_faq_updated_at
  BEFORE UPDATE ON public.faq
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_updated_at_column();