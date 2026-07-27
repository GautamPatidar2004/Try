
-- 1. stay_check_ins
CREATE TABLE public.stay_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.collaboration_agreements(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  checked_in_at TIMESTAMPTZ,
  check_in_photo_url TEXT,
  check_in_notes TEXT,
  checked_out_at TIMESTAMPTZ,
  check_out_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agreement_id)
);

ALTER TABLE public.stay_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creator manages own check-in"
ON public.stay_check_ins FOR ALL
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Host views check-in for own property"
ON public.stay_check_ins FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.collaboration_agreements ca
  JOIN public.applications a ON a.id = ca.application_id
  JOIN public.properties p ON p.id = a.property_id
  WHERE ca.id = stay_check_ins.agreement_id AND p.host_id = auth.uid()
));

CREATE POLICY "Admins full access check-ins"
ON public.stay_check_ins FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_stay_check_ins_updated
BEFORE UPDATE ON public.stay_check_ins
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. stay_deliverables
CREATE TABLE public.stay_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.collaboration_agreements(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  due_date DATE,
  deliverable_type TEXT NOT NULL DEFAULT 'post',
  status TEXT NOT NULL DEFAULT 'pending',
  content_post_id UUID REFERENCES public.content_posts(id) ON DELETE SET NULL,
  host_feedback TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agreement_id, day_number)
);

CREATE INDEX idx_stay_deliverables_creator ON public.stay_deliverables(creator_id);
CREATE INDEX idx_stay_deliverables_agreement ON public.stay_deliverables(agreement_id);

ALTER TABLE public.stay_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creator views own deliverables"
ON public.stay_deliverables FOR SELECT
USING (auth.uid() = creator_id);

CREATE POLICY "Creator updates own deliverables"
ON public.stay_deliverables FOR UPDATE
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Host views deliverables for own property"
ON public.stay_deliverables FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.collaboration_agreements ca
  JOIN public.applications a ON a.id = ca.application_id
  JOIN public.properties p ON p.id = a.property_id
  WHERE ca.id = stay_deliverables.agreement_id AND p.host_id = auth.uid()
));

CREATE POLICY "Host updates deliverable approvals"
ON public.stay_deliverables FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.collaboration_agreements ca
  JOIN public.applications a ON a.id = ca.application_id
  JOIN public.properties p ON p.id = a.property_id
  WHERE ca.id = stay_deliverables.agreement_id AND p.host_id = auth.uid()
));

CREATE POLICY "Admins full access deliverables"
ON public.stay_deliverables FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_stay_deliverables_updated
BEFORE UPDATE ON public.stay_deliverables
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. link content_posts to a deliverable slot
ALTER TABLE public.content_posts
ADD COLUMN stay_deliverable_id UUID REFERENCES public.stay_deliverables(id) ON DELETE SET NULL;

CREATE INDEX idx_content_posts_stay_deliverable ON public.content_posts(stay_deliverable_id);

-- 4. Generator function: seed deliverable slots for an agreement
CREATE OR REPLACE FUNCTION public.generate_stay_deliverables(p_agreement_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_creator_id UUID;
  v_start DATE;
  v_end DATE;
  v_deliverable_count INTEGER;
  v_stay_days INTEGER;
  v_slots INTEGER;
  v_i INTEGER;
  v_due DATE;
  v_inserted INTEGER := 0;
BEGIN
  SELECT ca.influencer_id, a.proposed_dates_start, a.proposed_dates_end, COALESCE(ca.deliverable_count, 1)
  INTO v_creator_id, v_start, v_end, v_deliverable_count
  FROM public.collaboration_agreements ca
  JOIN public.applications a ON a.id = ca.application_id
  WHERE ca.id = p_agreement_id;

  IF v_creator_id IS NULL THEN
    RETURN 0;
  END IF;

  v_stay_days := GREATEST(COALESCE((v_end - v_start), 1), 1);
  v_slots := GREATEST(v_deliverable_count, 1);

  FOR v_i IN 1..v_slots LOOP
    IF v_start IS NOT NULL THEN
      v_due := v_start + ((v_i - 1) * GREATEST(v_stay_days / v_slots, 1));
    ELSE
      v_due := NULL;
    END IF;

    INSERT INTO public.stay_deliverables (agreement_id, creator_id, day_number, due_date, deliverable_type, status)
    VALUES (p_agreement_id, v_creator_id, v_i, v_due, 'post', 'pending')
    ON CONFLICT (agreement_id, day_number) DO NOTHING;

    v_inserted := v_inserted + 1;
  END LOOP;

  RETURN v_inserted;
END;
$$;
