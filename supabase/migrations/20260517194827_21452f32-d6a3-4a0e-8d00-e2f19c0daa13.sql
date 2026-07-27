CREATE TABLE public.popup_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('shown','dismissed','cta_clicked','auth_landed','signup_completed','onboarding_completed')),
  popup_name text NOT NULL DEFAULT 'scroll_signup',
  session_id text NOT NULL,
  cta_user_type text CHECK (cta_user_type IN ('creator','host')),
  user_id uuid,
  path text,
  referrer text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_popup_events_session ON public.popup_events(session_id);
CREATE INDEX idx_popup_events_type ON public.popup_events(event_type);
CREATE INDEX idx_popup_events_created ON public.popup_events(created_at DESC);

ALTER TABLE public.popup_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert popup events"
ON public.popup_events FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view popup events"
ON public.popup_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));