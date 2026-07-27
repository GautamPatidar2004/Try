-- Add contract-related columns to collaboration_agreements
ALTER TABLE public.collaboration_agreements
ADD COLUMN IF NOT EXISTS contract_version text DEFAULT 'v1.0',
ADD COLUMN IF NOT EXISTS contract_pdf_url text,
ADD COLUMN IF NOT EXISTS host_signature_data jsonb,
ADD COLUMN IF NOT EXISTS influencer_signature_data jsonb,
ADD COLUMN IF NOT EXISTS host_legal_name text,
ADD COLUMN IF NOT EXISTS influencer_legal_name text,
ADD COLUMN IF NOT EXISTS host_ip_address text,
ADD COLUMN IF NOT EXISTS influencer_ip_address text,
ADD COLUMN IF NOT EXISTS host_signed_at timestamptz,
ADD COLUMN IF NOT EXISTS influencer_signed_at timestamptz;

-- Create storage bucket for collaboration contract signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('collaboration-contracts', 'collaboration-contracts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Only agreement parties can view their contract files
CREATE POLICY "Agreement parties can view their contract files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'collaboration-contracts' AND
  (
    EXISTS (
      SELECT 1 FROM public.collaboration_agreements ca
      WHERE ca.id::text = (storage.foldername(name))[1]
      AND (ca.host_id = auth.uid() OR ca.influencer_id = auth.uid())
    )
  )
);

-- Comment on new columns for documentation
COMMENT ON COLUMN public.collaboration_agreements.contract_version IS 'Version of the contract template used';
COMMENT ON COLUMN public.collaboration_agreements.host_signature_data IS 'Host signature image data and metadata';
COMMENT ON COLUMN public.collaboration_agreements.influencer_signature_data IS 'Influencer signature image data and metadata';
COMMENT ON COLUMN public.collaboration_agreements.host_legal_name IS 'Legal name provided by host when signing';
COMMENT ON COLUMN public.collaboration_agreements.influencer_legal_name IS 'Legal name provided by influencer when signing';
COMMENT ON COLUMN public.collaboration_agreements.host_ip_address IS 'IP address of host when signing for audit trail';
COMMENT ON COLUMN public.collaboration_agreements.influencer_ip_address IS 'IP address of influencer when signing for audit trail';