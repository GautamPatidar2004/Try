-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can insert their own events" ON analytics_events;

-- Create new permissive policy for analytics that supports anonymous and authenticated users
CREATE POLICY "Anyone can insert analytics events" ON analytics_events
FOR INSERT
WITH CHECK (
  -- Authenticated users must match their user_id OR use null
  (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
  OR
  -- Anonymous users can only insert with null user_id
  (auth.uid() IS NULL AND user_id IS NULL)
);