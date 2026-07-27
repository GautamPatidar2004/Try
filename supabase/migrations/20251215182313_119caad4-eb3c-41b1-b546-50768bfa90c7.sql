-- Add foreign key constraints for reviews_and_ratings table
-- These ensure proper joins with profiles table

-- First check if constraints exist and drop if needed to avoid errors
DO $$ 
BEGIN
  -- Add foreign key from reviewer_id to profiles.id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_and_ratings_reviewer_id_fkey' 
    AND table_name = 'reviews_and_ratings'
  ) THEN
    ALTER TABLE public.reviews_and_ratings 
    ADD CONSTRAINT reviews_and_ratings_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key from reviewee_id to profiles.id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_and_ratings_reviewee_id_fkey' 
    AND table_name = 'reviews_and_ratings'
  ) THEN
    ALTER TABLE public.reviews_and_ratings 
    ADD CONSTRAINT reviews_and_ratings_reviewee_id_fkey 
    FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;