import { useMemo } from 'react';
import { useProperties } from './useProperties';

 // Calculate creator price based on base rate and collaboration type
 const calculateCreatorPrice = (
   baseRate: number | null | undefined, 
   collabType: string, 
   discountPct: number | null | undefined
 ): number => {
   if (!baseRate) return 0;
   const baseInDollars = baseRate / 100;
   
   if (collabType === 'free_stay') return 0;
   if (collabType === 'discount' && discountPct) {
     return Math.round(baseInDollars * (1 - discountPct / 100));
   }
   return baseInDollars;
 };
 
// Transform database properties to match marketplace format
export const useMarketplaceData = () => {
  const { properties: dbProperties, loading, refetch } = useProperties();

  const marketplaceProperties = useMemo(() => {
    return dbProperties.map(prop => {
      // Sort images: primary first, then by display_order
      const sortedImages = prop.property_images
        .sort((a, b) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return (a.display_order || 0) - (b.display_order || 0);
        })
        .map(img => img.image_url);

      // Use all images or fallback to placeholder
      const images = sortedImages.length > 0 
        ? sortedImages 
        : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'];

      return {
        id: prop.id,
        title: prop.title,
        location: prop.location,
        coordinates: {
          lat: 40.7128, // Default coordinates - could be enhanced with geocoding
          lng: -74.0060
        },
        images,
        rating: prop.average_rating || null,
        reviews: prop.review_count || 0,
        type: prop.property_type.replace('_', ' '),
        guests: prop.max_guests,
        bedrooms: prop.bedrooms || 1,
        bathrooms: prop.bathrooms || 1,
         pricePerNight: calculateCreatorPrice(
           prop.base_nightly_rate, 
           prop.collaboration_type, 
           prop.discount_percentage
         ),
         originalPrice: prop.base_nightly_rate ? prop.base_nightly_rate / 100 : null,
         discount: prop.discount_percentage,
        amenities: prop.amenities || [],
        contentRequirements: prop.content_requirements || [],
        collaborationType: formatCollaborationType(prop.collaboration_type, prop.discount_percentage),
        isSuperhost: true, // Could be calculated from host rating
        host: {
          name: `${prop.host.profile.first_name || ''} ${prop.host.profile.last_name || ''}`.trim() || 'Host',
          avatar: prop.host.profile.profile_photo_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
          responseRate: 95, // Could be calculated
          business: prop.host.business_name
        },
        availableDates: 'Available soon', // Could be enhanced with actual availability
        description: prop.description || `Experience this amazing ${prop.property_type.replace('_', ' ')} in ${prop.location}.`
      };
    });
  }, [dbProperties]);

  return {
    properties: marketplaceProperties,
    loading,
    refetch
  };
};

const formatCollaborationType = (type: string, discount?: number) => {
  switch (type) {
    case 'free_stay':
      return 'Free Stay';
    case 'discount':
      return `${discount}% Discount`;
    case 'paid':
      return 'Paid Collaboration';
    default:
      return type.replace('_', ' ');
  }
};