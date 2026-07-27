-- Drop the insecure public SELECT policy that exposes personal data
DROP POLICY "Anyone can check email existence" ON public.giveaway_entries;