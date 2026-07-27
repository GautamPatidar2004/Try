-- Add notification tracking columns to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS notification_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_email_sent_at TIMESTAMPTZ;

-- Add notification tracking columns to brand_campaign_applications table
ALTER TABLE brand_campaign_applications 
ADD COLUMN IF NOT EXISTS notification_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_email_sent_at TIMESTAMPTZ;

-- Create partial indexes for efficient querying of pending notifications
CREATE INDEX IF NOT EXISTS idx_applications_notification_pending 
ON applications(notification_email_sent) 
WHERE notification_email_sent = false;

CREATE INDEX IF NOT EXISTS idx_brand_campaign_applications_notification_pending 
ON brand_campaign_applications(notification_email_sent) 
WHERE notification_email_sent = false;