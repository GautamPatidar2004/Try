
-- Add content delivery tracking to applications table
ALTER TABLE applications 
ADD COLUMN content_delivery_status text DEFAULT 'pending',
ADD COLUMN content_deadline date,
ADD COLUMN delivered_at timestamp with time zone;

-- Update content_posts table to link with applications for delivery tracking
ALTER TABLE content_posts 
ADD COLUMN application_id uuid REFERENCES applications(id),
ADD COLUMN delivery_status text DEFAULT 'draft',
ADD COLUMN hashtags text[],
ADD COLUMN mentions text[],
ADD COLUMN posting_date timestamp with time zone,
ADD COLUMN host_approval_status text DEFAULT 'pending';

-- Create index for better query performance
CREATE INDEX idx_applications_content_delivery ON applications(influencer_id, content_delivery_status);
CREATE INDEX idx_content_posts_delivery ON content_posts(application_id, delivery_status);

-- Add check constraints for valid status values
ALTER TABLE applications 
ADD CONSTRAINT check_content_delivery_status 
CHECK (content_delivery_status IN ('pending', 'in_progress', 'delivered', 'approved', 'revision_requested'));

ALTER TABLE content_posts 
ADD CONSTRAINT check_delivery_status 
CHECK (delivery_status IN ('draft', 'submitted', 'approved', 'revision_requested', 'published'));

ALTER TABLE content_posts 
ADD CONSTRAINT check_host_approval_status 
CHECK (host_approval_status IN ('pending', 'approved', 'rejected', 'revision_requested'));
