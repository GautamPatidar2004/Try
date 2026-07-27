-- Create brand_documents table for document verification
CREATE TABLE IF NOT EXISTS brand_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('business_license', 'tax_id', 'brand_guidelines', 'other')),
  document_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for brand_documents
ALTER TABLE brand_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brand owners can manage their documents"
ON brand_documents FOR ALL TO public
USING (
  brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all brand documents"
ON brand_documents FOR ALL TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_documents_brand_id ON brand_documents(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_documents_status ON brand_documents(status);

-- Create storage bucket for brand documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-documents', 'brand-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for brand documents
CREATE POLICY "Brand owners can upload their documents"
ON storage.objects FOR INSERT TO public
WITH CHECK (
  bucket_id = 'brand-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Brand owners can view their documents"
ON storage.objects FOR SELECT TO public
USING (
  bucket_id = 'brand-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Brand owners can delete their documents"
ON storage.objects FOR DELETE TO public
USING (
  bucket_id = 'brand-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can manage all brand documents in storage"
ON storage.objects FOR ALL TO public
USING (
  bucket_id = 'brand-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);