-- Create bulk match operations tracking table
CREATE TABLE IF NOT EXISTS public.bulk_match_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  total_combinations INTEGER NOT NULL,
  processed_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  batch_size INTEGER DEFAULT 10,
  current_batch INTEGER DEFAULT 0,
  started_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_log JSONB DEFAULT '[]'::jsonb,
  configuration JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bulk_match_operations ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view operations
CREATE POLICY "Admins can view all bulk operations"
ON public.bulk_match_operations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can insert operations
CREATE POLICY "Admins can create bulk operations"
ON public.bulk_match_operations
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can update operations
CREATE POLICY "Admins can update bulk operations"
ON public.bulk_match_operations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_bulk_match_operations_updated_at
BEFORE UPDATE ON public.bulk_match_operations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();