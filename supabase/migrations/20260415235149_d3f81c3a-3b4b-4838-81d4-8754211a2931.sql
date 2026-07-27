
-- Create crm_leads table for external prospects
CREATE TABLE public.crm_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  lead_type TEXT NOT NULL DEFAULT 'brand',
  lifecycle_stage TEXT NOT NULL DEFAULT 'lead',
  source TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  converted_profile_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view all leads" ON public.crm_leads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create leads" ON public.crm_leads
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads" ON public.crm_leads
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads" ON public.crm_leads
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_crm_leads_lifecycle_stage ON public.crm_leads(lifecycle_stage);
CREATE INDEX idx_crm_leads_lead_type ON public.crm_leads(lead_type);
CREATE INDEX idx_crm_leads_assigned_to ON public.crm_leads(assigned_to);

-- Updated_at trigger
CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add lead_id to crm_notes so notes can be attached to leads
ALTER TABLE public.crm_notes ADD COLUMN lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE;
CREATE INDEX idx_crm_notes_lead_id ON public.crm_notes(lead_id);

-- Make user_id nullable on crm_notes (was NOT NULL, now a note can be on a lead instead)
ALTER TABLE public.crm_notes ALTER COLUMN user_id DROP NOT NULL;

-- Add lead_id to crm_tasks
ALTER TABLE public.crm_tasks ADD COLUMN lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL;
CREATE INDEX idx_crm_tasks_lead_id ON public.crm_tasks(lead_id);
