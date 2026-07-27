-- Add contract-related columns to ambassador_members
ALTER TABLE ambassador_members
ADD COLUMN IF NOT EXISTS contract_signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contract_signature_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contract_version TEXT DEFAULT 'v1.0',
ADD COLUMN IF NOT EXISTS contract_ip_address TEXT,
ADD COLUMN IF NOT EXISTS agreed_to_terms BOOLEAN DEFAULT FALSE;

-- Update default status to pending (awaiting contract) instead of active
ALTER TABLE ambassador_members 
ALTER COLUMN status SET DEFAULT 'pending';

-- Create ambassador_contracts table for storing signed contracts
CREATE TABLE IF NOT EXISTS ambassador_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_member_id UUID NOT NULL REFERENCES ambassador_members(id) ON DELETE CASCADE,
  contract_pdf_url TEXT NOT NULL,
  signature_data JSONB NOT NULL DEFAULT '{}',
  legal_name TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  contract_version TEXT NOT NULL DEFAULT 'v1.0',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ambassador_contracts_member_id ON ambassador_contracts(ambassador_member_id);

-- Enable RLS on ambassador_contracts
ALTER TABLE ambassador_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ambassador_contracts
CREATE POLICY "Users can view their own contracts"
  ON ambassador_contracts FOR SELECT
  USING (
    ambassador_member_id IN (
      SELECT id FROM ambassador_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert contracts"
  ON ambassador_contracts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all contracts"
  ON ambassador_contracts FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for signed contracts (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ambassador-contracts', 'ambassador-contracts', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for ambassador-contracts bucket
CREATE POLICY "Users can view their own contract files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ambassador-contracts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "System can upload contract files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ambassador-contracts');

CREATE POLICY "Admins can view all contract files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ambassador-contracts' AND
    has_role(auth.uid(), 'admin'::app_role)
  );