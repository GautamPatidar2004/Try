-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can submit giveaway entry" ON giveaway_entries;

-- Create new policy that allows anonymous AND authenticated users
CREATE POLICY "Public can submit giveaway entries"
ON giveaway_entries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);