import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PropertyFilterOptions {
  propertyTypes: string[];
  amenities: string[];
  collaborationTypes: string[];
  priceRange: { min: number; max: number };
  loading: boolean;
}

export const usePropertyFilterOptions = (): PropertyFilterOptions => {
  // Fetch unique property types
  const { data: propertyTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ['property-filter-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('property_type')
        .eq('is_active', true);
      
      if (error) throw error;
      
      const uniqueTypes = [...new Set(data.map(p => p.property_type))].filter(Boolean);
      return uniqueTypes.sort();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch unique amenities from all properties
  const { data: amenities = [], isLoading: amenitiesLoading } = useQuery({
    queryKey: ['property-filter-amenities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('amenities')
        .eq('is_active', true);
      
      if (error) throw error;
      
      const allAmenities = data.flatMap(p => p.amenities || []);
      const uniqueAmenities = [...new Set(allAmenities)].filter(Boolean);
      return uniqueAmenities.sort();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch unique collaboration types
  const { data: collaborationTypes = [], isLoading: collabLoading } = useQuery({
    queryKey: ['property-filter-collaboration-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('collaboration_type')
        .eq('is_active', true);
      
      if (error) throw error;
      
      const uniqueTypes = [...new Set(data.map(p => p.collaboration_type))].filter(Boolean);
      return uniqueTypes.sort();
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    propertyTypes: propertyTypes.length > 0 ? propertyTypes : ['house', 'apartment', 'villa', 'cabin', 'condo', 'cottage'],
    amenities: amenities.length > 0 ? amenities : [
      'WiFi', 'Kitchen', 'Parking', 'Pool', 'Gym', 'Air Conditioning',
      'Heating', 'Hot Tub', 'Balcony', 'Garden', 'Beach Access',
      'Pet Friendly', 'Wheelchair Accessible', 'Laundry', 'TV', 'Fireplace'
    ],
    collaborationTypes: collaborationTypes.length > 0 ? collaborationTypes : ['free_stay', 'discount', 'paid'],
    priceRange: { min: 0, max: 1000 },
    loading: typesLoading || amenitiesLoading || collabLoading,
  };
};
