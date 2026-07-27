-- Add last_processed_at to automation_flows
ALTER TABLE public.automation_flows
ADD COLUMN IF NOT EXISTS last_processed_at TIMESTAMPTZ DEFAULT now();

-- Create execution log table
CREATE TABLE IF NOT EXISTS public.automation_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES public.automation_enrollments(id) ON DELETE CASCADE,
  step_id UUID REFERENCES public.automation_steps(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  result JSONB DEFAULT '{}',
  executed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automation_execution_log ENABLE ROW LEVEL SECURITY;

-- Admin-only read access
CREATE POLICY "Admins can view execution logs"
ON public.automation_execution_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups by enrollment
CREATE INDEX IF NOT EXISTS idx_execution_log_enrollment ON public.automation_execution_log(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_execution_log_executed_at ON public.automation_execution_log(executed_at DESC);