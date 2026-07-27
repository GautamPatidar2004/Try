import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  location: string;
  property_type: string;
  collaboration_type: string;
  discount_percentage?: number;
  max_guests: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  amenities?: string[];
  content_requirements?: string[];
  host: {
    id: string;
    business_name?: string;
    profile: {
      first_name?: string;
      last_name?: string;
      profile_photo_url?: string;
    };
  };
  property_images: Array<{
    image_url: string;
    is_primary: boolean;
    display_order?: number;
  }>;
  review_count?: number;
  average_rating?: number;
   base_nightly_rate?: number;
   currency?: string;
}

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          hosts!inner(
            id,
            business_name,
            profiles!inner(
              first_name,
              last_name,
              profile_photo_url
            )
          ),
          property_images(
            image_url,
            is_primary,
            display_order
          ),
          property_review_stats(
            review_count,
            average_rating
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match the expected format
      const transformedProperties = data?.map(prop => {
        // Get review stats from the view (it returns an array, take first item)
        const reviewStats = (prop as any).property_review_stats?.[0];
        
        return {
          id: prop.id,
          title: prop.title,
          location: prop.location,
          property_type: prop.property_type,
          collaboration_type: prop.collaboration_type,
          discount_percentage: prop.discount_percentage,
          max_guests: prop.max_guests,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          description: prop.description,
          amenities: prop.amenities || [],
          content_requirements: prop.content_requirements || [],
          host: {
            id: prop.hosts.id,
            business_name: prop.hosts.business_name,
            profile: prop.hosts.profiles
          },
          property_images: prop.property_images || [],
          review_count: reviewStats?.review_count || 0,
           average_rating: reviewStats?.average_rating || null,
           base_nightly_rate: prop.base_nightly_rate,
           currency: prop.currency || 'USD'
        };
      }) || [];

      setProperties(transformedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    properties,
    loading,
    refetch: fetchProperties
  };
};