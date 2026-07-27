
-- Create a table to store host applications
CREATE TABLE public.host_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS on host applications
ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own applications
CREATE POLICY "Users can view their own host applications" 
  ON public.host_applications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own applications
CREATE POLICY "Users can create host applications" 
  ON public.host_applications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow admins to view all applications
CREATE POLICY "Admins can view all host applications" 
  ON public.host_applications 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create a table for admin notifications
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on admin notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to view all notifications
CREATE POLICY "Admins can view all notifications" 
  ON public.admin_notifications 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy to allow admins to update notifications (mark as read)
CREATE POLICY "Admins can update notifications" 
  ON public.admin_notifications 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
