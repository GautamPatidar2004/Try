import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertyFormSchema, PropertyFormData } from "../propertyFormSchema";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseEditPropertyFormProps {
  property: any;
  isOpen: boolean;
  onPropertyUpdated: () => void;
  onClose: () => void;
}

export const useEditPropertyForm = ({
  property,
  isOpen,
  onPropertyUpdated,
  onClose,
}: UseEditPropertyFormProps) => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      property_type: "",
      max_guests: 1,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
      content_requirements: [],
      currency: 'USD',
    },
  });

  useEffect(() => {
    if (property && isOpen) {
      // Populate form with existing property data
      form.reset({
        title: property.title,
        description: property.description || "",
        location: property.location,
        property_type: property.property_type,
        max_guests: property.max_guests,
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        amenities: property.amenities || [],
        content_requirements: property.content_requirements || [],
        currency: property.currency || 'USD',
      });

      // Fetch existing images
      fetchExistingImages();
    }
  }, [property, isOpen, form]);

  const fetchExistingImages = async () => {
    if (!property?.id) {
      return;
    }
    
    setIsLoadingImages(true);
    setImageLoadError(null);
    setExistingImages([]);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', property.id)
        .order('display_order');

      if (error) {
        console.error('Database error fetching images:', error);
        throw error;
      }

      setExistingImages(data || []);
      
      const primaryIndex = data?.findIndex(img => img.is_primary) || 0;
      setPrimaryImageIndex(primaryIndex);
    } catch (error) {
      console.error('Error fetching existing images:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load existing images';
      setImageLoadError(errorMessage);
      setExistingImages([]);
      
      toast({
        title: "Warning",
        description: "Failed to load existing images. You may need to upload new ones.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleSubmit = async (data: PropertyFormData) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error: propertyError } = await supabase
        .from('properties')
        .update({
          title: data.title,
          description: data.description || null,
          location: data.location,
          property_type: data.property_type,
          max_guests: data.max_guests,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          amenities: data.amenities,
          collaboration_type: 'free_stay',
          discount_percentage: null,
          content_requirements: data.content_requirements,
          base_nightly_rate: null,
          currency: data.currency || 'USD',
        })
        .eq('id', property.id);

      if (propertyError) throw propertyError;

      if (uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
          const file = uploadedImages[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${property.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName);

          const shouldBePrimary = existingImages.length === 0 && i === 0;

          const { error: dbError } = await supabase
            .from('property_images')
            .insert({
              property_id: property.id,
              image_url: urlData.publicUrl,
              is_primary: shouldBePrimary,
              display_order: existingImages.length + i,
            });

          if (dbError) {
            console.error('Database error:', dbError);
            throw dbError;
          }
        }
      }

      toast({
        title: "Success!",
        description: "Your property has been updated successfully.",
      });

      onPropertyUpdated();
      handleClose();
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetExistingPrimary = async (imageId: string) => {
    try {
      // First, unset all existing primary images for this property
      const { error: unsetError } = await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', property.id);

      if (unsetError) throw unsetError;

      // Then set the selected image as primary
      const { error: setPrimaryError } = await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (setPrimaryError) throw setPrimaryError;

      // Update local state
      setExistingImages(prev => 
        prev.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }))
      );

      toast({
        title: "Success!",
        description: "Primary image updated.",
      });
    } catch (error) {
      console.error('Error setting primary image:', error);
      toast({
        title: "Error",
        description: "Failed to set primary image.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    try {
      const imageToRemove = existingImages.find(img => img.id === imageId);
      if (!imageToRemove) return;

      // Delete from storage
      const urlParts = imageToRemove.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${property.id}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('property-images')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Update local state
      const updatedImages = existingImages.filter(img => img.id !== imageId);
      setExistingImages(updatedImages);

      // If we removed the primary image and there are other images, make the first one primary
      if (imageToRemove.is_primary && updatedImages.length > 0) {
        handleSetExistingPrimary(updatedImages[0].id);
      }

      toast({
        title: "Success!",
        description: "Image removed successfully.",
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    // Don't allow closing while submitting
    if (isSubmitting) {
      toast({
        title: "Please wait",
        description: "Property is being updated. Please wait for completion.",
      });
      return;
    }
    
    onClose();
    form.reset();
    setUploadedImages([]);
    setPrimaryImageIndex(0);
    setExistingImages([]);
    setIsLoadingImages(false);
    setImageLoadError(null);
    setIsSubmitting(false);
  };

  return {
    form,
    uploadedImages,
    setUploadedImages,
    primaryImageIndex,
    setPrimaryImageIndex,
    existingImages,
    onSetExistingPrimary: handleSetExistingPrimary,
    onRemoveExistingImage: handleRemoveExistingImage,
    isLoadingImages,
    imageLoadError,
    isSubmitting,
    handleSubmit,
    handleClose,
  };
};