
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { PropertyFormData } from "./propertyFormSchema";

interface SubmitPropertyData extends PropertyFormData {
  hostId: string;
  images: File[];
  primaryImageIndex: number;
}

interface UsePropertySubmissionProps {
  onSuccess: () => void;
}

export const usePropertySubmission = ({ onSuccess }: UsePropertySubmissionProps) => {
  const navigate = useNavigate();
  const { subscriptionStatus } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File, propertyId: string, isPrimary: boolean, displayOrder: number, retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(`Authentication error: ${sessionError.message}`);
      if (!session) throw new Error('User session not found. Please log in again.');

      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) throw new Error(`Failed to upload image ${file.name}: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('property_images')
        .insert({
          property_id: propertyId,
          image_url: urlData.publicUrl,
          is_primary: isPrimary,
          display_order: displayOrder,
        });

      if (dbError) {
        await supabase.storage.from('property-images').remove([fileName]);
        throw new Error(`Failed to save image metadata: ${dbError.message}`);
      }
    } catch (error) {
      if (retryCount < maxRetries && error instanceof Error) {
        const isRetryableError = 
          error.message.includes('Authentication error') ||
          error.message.includes('session') ||
          error.message.includes('network') ||
          error.message.includes('timeout');
          
        if (isRetryableError) {
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
          return uploadImage(file, propertyId, isPrimary, displayOrder, retryCount + 1);
        }
      }
      throw error;
    }
  };

  const submitProperty = async (data: SubmitPropertyData) => {
    if (isSubmitting) return;

    if (!subscriptionStatus?.hasActiveSubscription) {
      toast({
        title: "Active Subscription Required",
        description: "Please subscribe to a plan to start listing properties.",
        variant: "destructive"
      });
      navigate('/pricing');
      return;
    }

    setIsLoading(true);
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please log in to create a property.');

      const campaignRate = data.campaign_rate;
      const creatorPayoutCents = Math.round((campaignRate || 0) * 100);

      // Insert directly into properties table
      const { data: property, error: insertError } = await supabase
        .from('properties')
        .insert({
          host_id: session.user.id,
          title: data.title,
          description: data.description || null,
          location: data.location,
          property_type: data.property_type,
          max_guests: data.max_guests || 1,
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          amenities: data.amenities || [],
          collaboration_type: 'free_stay',
          discount_percentage: null,
          content_requirements: data.content_requirements || [],
          base_nightly_rate: null,
          currency: data.currency || 'USD',
          campaign_rate: campaignRate,
          platform_fee: 0,
          creator_payout: creatorPayoutCents,
          payment_status: 'paid',
          is_active: true,
        })
        .select('id')
        .single();

      if (insertError || !property) {
        throw new Error(insertError?.message || 'Failed to create property');
      }

      const propertyId = property.id;

      // Upload images before completing
      if (data.images.length > 0 && propertyId) {
        const uploadPromises = data.images.map((file, i) =>
          uploadImage(file, propertyId, i === data.primaryImageIndex, i)
        );
        
        try {
          await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Images partially uploaded",
            description: "Some images failed to upload. You can add images later by editing the property.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Property listed!",
        description: "Your property listing is now active.",
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating property:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create property. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return { submitProperty, isLoading, isSubmitting };
};
