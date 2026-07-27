import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BusinessDetails {
  businessLicenseNumber?: string;
  taxId?: string;
  yearEstablished?: number;
}

export interface VerificationStatus {
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  documents: string[];
  businessDetails?: BusinessDetails;
}

export const useRestaurantVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadDocument = async (
    file: File,
    docType: string,
    restaurantOwnerId: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only PDF, JPG, and PNG are allowed');
      }

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurantOwnerId}/${docType}_${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('restaurant-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-documents')
        .getPublicUrl(fileName);

      toast({
        title: 'Document uploaded',
        description: 'Your document has been uploaded successfully.',
      });

      return publicUrl;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload document';
      setError(errorMessage);
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationDetails = async (
    restaurantOwnerId: string,
    details: BusinessDetails,
    documents: string[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const verificationData = {
        business_license_number: details.businessLicenseNumber,
        tax_id: details.taxId,
        year_established: details.yearEstablished,
        verification_documents: documents,
        verification_status: documents.length > 0 ? 'pending' : 'unverified',
      };

      const { error: updateError } = await supabase
        .from('restaurant_owners')
        .update(verificationData)
        .eq('id', restaurantOwnerId);

      if (updateError) throw updateError;

      toast({
        title: 'Verification details updated',
        description: 'Your business information has been saved.',
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update verification details';
      setError(errorMessage);
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatus = async (
    restaurantOwnerId: string
  ): Promise<VerificationStatus | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('restaurant_owners')
        .select('verification_status, verification_documents')
        .eq('id', restaurantOwnerId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) return null;

      return {
        status: data.verification_status as VerificationStatus['status'],
        documents: (data.verification_documents as string[]) || [],
        businessDetails: undefined,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch verification status';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadDocument,
    updateVerificationDetails,
    getVerificationStatus,
    loading,
    error,
  };
};
