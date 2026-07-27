-- Add RLS policies for brands to manage their own campaigns

-- Allow brands to create their own campaigns
CREATE POLICY "Brands can create their own campaigns"
  ON brand_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow brands to update their own campaigns
CREATE POLICY "Brands can update their own campaigns"
  ON brand_campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow brands to view their own campaigns
CREATE POLICY "Brands can view their own campaigns"
  ON brand_campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Add index for performance on created_by lookups
CREATE INDEX IF NOT EXISTS idx_brand_campaigns_created_by 
  ON brand_campaigns(created_by);