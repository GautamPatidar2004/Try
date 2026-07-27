-- Create storage bucket for restaurant documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-documents', 'restaurant-documents', false);

-- RLS Policies for restaurant-documents bucket
CREATE POLICY "Owners can upload their documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owners can view their documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'restaurant-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'restaurant-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Add restaurant owner badge definitions
INSERT INTO badge_definitions (name, description, icon, criteria, points_reward, category, tier, is_active)
VALUES 
  ('Restaurant Ready', 'Completed restaurant profile setup', '🍽️', 
   '{"type": "restaurant_onboarding", "step": 1}'::jsonb, 100, 'onboarding', 'bronze', true),
  ('Document Submitted', 'Submitted verification documents', '📄', 
   '{"type": "restaurant_verification"}'::jsonb, 50, 'verification', 'bronze', true),
  ('Collaboration Ready', 'Configured collaboration settings', '🤝', 
   '{"type": "restaurant_onboarding", "step": 3}'::jsonb, 150, 'onboarding', 'silver', true),
  ('Restaurant Launched', 'Completed full restaurant onboarding', '🚀', 
   '{"type": "restaurant_onboarding", "complete": true}'::jsonb, 200, 'milestone', 'gold', true);