-- Allow anonymous users to check if an email already exists in giveaway entries
-- This enables duplicate prevention for the public giveaway form
CREATE POLICY "Anyone can check email existence"
ON giveaway_entries
FOR SELECT
TO anon, authenticated
USING (true);