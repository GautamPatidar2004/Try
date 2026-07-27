-- Update the handle_new_user function to include referred_by_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, user_type, referred_by_code)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    NULL,
    new.raw_user_meta_data ->> 'referred_by_code'
  );
  RETURN new;
END;
$function$;