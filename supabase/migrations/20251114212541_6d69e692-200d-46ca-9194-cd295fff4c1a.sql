-- Add RLS policies for brands to manage applications for their campaigns

-- Brands can view applications for their own campaigns
CREATE POLICY "Brands can view applications for own campaigns"
  ON brand_campaign_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM brand_campaigns 
      WHERE brand_campaigns.id = brand_campaign_applications.campaign_id 
      AND brand_campaigns.created_by = auth.uid()
    )
  );

-- Brands can update application status for their campaigns
CREATE POLICY "Brands can update applications for own campaigns"
  ON brand_campaign_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM brand_campaigns 
      WHERE brand_campaigns.id = brand_campaign_applications.campaign_id 
      AND brand_campaigns.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_campaigns 
      WHERE brand_campaigns.id = brand_campaign_applications.campaign_id 
      AND brand_campaigns.created_by = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_id 
  ON brand_campaign_applications(campaign_id);
  
CREATE INDEX IF NOT EXISTS idx_campaign_applications_influencer_id 
  ON brand_campaign_applications(influencer_id);

CREATE INDEX IF NOT EXISTS idx_campaign_applications_status 
  ON brand_campaign_applications(status);