import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logger from "@/utils/logger";

export const useImageCleanup = () => {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { toast } = useToast();

  const cleanupDuplicateImages = async (propertyId: string) => {
    setIsCleaningUp(true);
    
    try {
      logger.log(`[CLEANUP] Starting cleanup for property ${propertyId}`);
      
      const { data: images, error: fetchError } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at');

      if (fetchError) {
        throw new Error(`Failed to fetch images: ${fetchError.message}`);
      }

      if (!images || images.length === 0) {
        toast({
          title: "No images found",
          description: "No images to clean up for this property.",
        });
        return;
      }

      logger.log(`[CLEANUP] Found ${images.length} images for property ${propertyId}`);

      const imagesByUrl = images.reduce((acc: Record<string, any[]>, img) => {
        const url = img.image_url;
        if (!acc[url]) acc[url] = [];
        acc[url].push(img);
        return acc;
      }, {});

      const duplicateGroups = Object.values(imagesByUrl).filter(group => group.length > 1);
      
      if (duplicateGroups.length === 0) {
        toast({
          title: "No duplicates found",
          description: "No duplicate images found for this property.",
        });
        return;
      }

      logger.log(`[CLEANUP] Found ${duplicateGroups.length} groups of duplicate images`);

      let deletedCount = 0;
      
      for (const duplicateGroup of duplicateGroups) {
        duplicateGroup.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        const toKeep = duplicateGroup[0];
        const toDelete = duplicateGroup.slice(1);
        
        logger.log(`[CLEANUP] Keeping image ${toKeep.id}, deleting ${toDelete.length} duplicates`);
        
        for (const img of toDelete) {
          const { error: deleteError } = await supabase
            .from('property_images')
            .delete()
            .eq('id', img.id);
            
          if (deleteError) {
            logger.error(`[CLEANUP ERROR] Failed to delete image ${img.id}:`, deleteError);
          } else {
            deletedCount++;
            logger.log(`[CLEANUP] Deleted duplicate image record ${img.id}`);
          }
        }
      }

      const { data: remainingImages } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('display_order');

      if (remainingImages && remainingImages.length > 0) {
        const hasPrimary = remainingImages.some(img => img.is_primary);
        
        if (!hasPrimary) {
          const { error: primaryError } = await supabase
            .from('property_images')
            .update({ is_primary: true })
            .eq('id', remainingImages[0].id);
            
          if (primaryError) {
            logger.error('[CLEANUP ERROR] Failed to set primary image:', primaryError);
          } else {
            logger.log('[CLEANUP] Set primary image for property');
          }
        }
      }

      toast({
        title: "Cleanup Complete",
        description: `Removed ${deletedCount} duplicate images. Property images have been organized.`,
      });

      logger.log(`[CLEANUP] Successfully removed ${deletedCount} duplicate images`);
      
    } catch (error) {
      logger.error('[CLEANUP ERROR]', error);
      toast({
        title: "Cleanup Failed",
        description: error instanceof Error ? error.message : "Failed to cleanup duplicate images",
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  return {
    cleanupDuplicateImages,
    isCleaningUp,
  };
};
