-- Add INSERT policy for admin_notifications table
-- This allows the system to create admin notifications when important events occur

CREATE POLICY "System can create admin notifications"
ON admin_notifications 
FOR INSERT
WITH CHECK (true);

-- Add INSERT policy for notifications table (also missing)
CREATE POLICY "System can create user notifications"
ON notifications
FOR INSERT
WITH CHECK (true);