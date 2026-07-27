
-- Make user_type column nullable to allow signup without immediate user type selection
ALTER TABLE public.profiles ALTER COLUMN user_type DROP NOT NULL;

-- Update the trigger function to handle nullable user_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, user_type)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    NULL  -- user_type will be set later in ProfileSetup
  );
  RETURN new;
END;
$$;
