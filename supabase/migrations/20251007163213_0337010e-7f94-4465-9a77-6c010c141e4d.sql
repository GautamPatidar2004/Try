-- Add foreign key constraints to enable PostgREST embedded selects for admin management

-- Add foreign key from user_roles.user_id to profiles.id
ALTER TABLE public.user_roles 
  ADD CONSTRAINT user_roles_user_id_profiles_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from user_roles.granted_by to profiles.id
ALTER TABLE public.user_roles 
  ADD CONSTRAINT user_roles_granted_by_profiles_fkey 
  FOREIGN KEY (granted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add foreign key from admin_activity_log.admin_id to profiles.id
ALTER TABLE public.admin_activity_log 
  ADD CONSTRAINT admin_activity_log_admin_id_profiles_fkey 
  FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;