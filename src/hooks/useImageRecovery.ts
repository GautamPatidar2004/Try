import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import logger from '@/utils/logger';

export const useImageRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const { toast } = useToast();

  const scanForOrphanedImages = async () => {
    logger.log('[RECOVERY] Starting scan for orphaned images...');
    
    try {
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('property-images')
        .list('', { limit: 1000 });

      if (storageError) {
        logger.error('[RECOVERY ERROR] Failed to list storage files:', storageError);
        return [];
      }

      logger.log(`[RECOVERY] Found ${storageFiles?.length || 0} files in storage`);

      const { data: dbImages, error: dbError } = await supabase
        .from('property_images')
        .select('image_url');

      if (dbError) {
        logger.error('[RECOVERY ERROR] Failed to fetch database images:', dbError);
        return [];
      }

      logger.log(`[RECOVERY] Found ${dbImages?.length || 0} image records in database`);

      const dbUrls = new Set(dbImages?.map(img => {
        const url = new URL(img.image_url);
        return url.pathname.split('/').pop();
      }) || []);

      const orphanedFiles = storageFiles?.filter(file => 
        file.name && !dbUrls.has(file.name)
      ) || [];

      logger.log(`[RECOVERY] Found ${orphanedFiles.length} orphaned files`);
      return orphanedFiles;

    } catch (error) {
      logger.error('[RECOVERY ERROR]', error);
      return [];
    }
  };

  const recoverMissingImages = async () => {
    setIsRecovering(true);
    
    try {
      logger.log('[RECOVERY] Starting image recovery process...');
      
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          host_id,
          property_images(id, is_primary)
        `);

      if (propertiesError) {
        throw propertiesError;
      }

      const propertiesWithoutImages = propertiesData?.filter(
        prop => !prop.property_images || prop.property_images.length === 0
      ) || [];

      const propertiesWithoutPrimary = propertiesData?.filter(
        prop => prop.property_images && prop.property_images.length > 0 && 
        !prop.property_images.some((img: any) => img.is_primary)
      ) || [];

      logger.log(`[RECOVERY] Found ${propertiesWithoutImages.length} properties without images`);
      logger.log(`[RECOVERY] Found ${propertiesWithoutPrimary.length} properties without primary images`);

      let recoveredCount = 0;
      
      for (const property of propertiesWithoutImages) {
        try {
          const { data: propertyFiles, error: listError } = await supabase.storage
            .from('property-images')
            .list(property.id, { limit: 100 });

          if (listError) {
            continue;
          }

          if (propertyFiles && propertyFiles.length > 0) {
            logger.log(`[RECOVERY] Found ${propertyFiles.length} orphaned images for property ${property.title}`);
            
            for (let i = 0; i < propertyFiles.length; i++) {
              const file = propertyFiles[i];
              const filePath = `${property.id}/${file.name}`;
              
              const { data: urlData } = supabase.storage
                .from('property-images')
                .getPublicUrl(filePath);

              const { error: insertError } = await supabase
                .from('property_images')
                .insert({
                  property_id: property.id,
                  image_url: urlData.publicUrl,
                  is_primary: i === 0,
                  display_order: i,
                });

              if (!insertError) {
                recoveredCount++;
                logger.log(`[RECOVERY] Recovered image ${file.name} for property ${property.title}`);
              } else {
                logger.error(`[RECOVERY ERROR] Failed to insert image record:`, insertError);
              }
            }
          }
        } catch (error) {
          logger.error(`[RECOVERY ERROR] Failed to process property ${property.id}:`, error);
        }
      }

      if (propertiesWithoutPrimary.length > 0) {
        logger.log('[RECOVERY] Fixing properties without primary images...');
        
        for (const property of propertiesWithoutPrimary) {
          try {
            const { error: updateError } = await supabase
              .from('property_images')
              .update({ is_primary: true })
              .eq('property_id', property.id)
              .eq('display_order', 0)
              .limit(1);

            if (!updateError) {
              recoveredCount++;
              logger.log(`[RECOVERY] Set primary image for property ${property.title}`);
            } else {
              logger.error(`[RECOVERY ERROR] Failed to set primary image:`, updateError);
            }
          } catch (error) {
            logger.error(`[RECOVERY ERROR] Failed to fix primary image for property ${property.id}:`, error);
          }
        }
      }

      if (recoveredCount > 0) {
        toast({
          title: "Images Recovered!",
          description: `Successfully recovered ${recoveredCount} images and linked them to properties.`,
        });
        logger.log(`[RECOVERY SUCCESS] Recovered ${recoveredCount} images`);
      } else {
        toast({
          title: "No Images to Recover",
          description: "No orphaned images were found that could be recovered.",
        });
        logger.log('[RECOVERY] No images needed recovery');
      }

      return recoveredCount;

    } catch (error) {
      logger.error('[RECOVERY ERROR]', error);
      toast({
        title: "Recovery Failed",
        description: "Failed to recover images. Please try again.",
        variant: "destructive",
      });
      return 0;
    } finally {
      setIsRecovering(false);
    }
  };

  return {
    scanForOrphanedImages,
    recoverMissingImages,
    isRecovering
  };
};
