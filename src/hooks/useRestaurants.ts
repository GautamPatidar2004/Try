import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  cuisine_types: string[];
  dining_style: string;
  price_range: string;
  dietary_options: string[];
  ambiance: string[];
  meal_types: string[];
  seating_capacity: number | null;
  has_outdoor_seating: boolean;
  has_private_dining: boolean;
  parking_available: boolean;
  collaboration_types: string[];
  content_requirements: string[];
  min_follower_count: number;
  paid_rate_min: number | null;
  paid_rate_max: number | null;
  currency: string;
  operating_hours: any;
  booking_slots: any;
  advance_booking_hours: number;
  max_party_size: number;
  is_active: boolean;
  featured: boolean;
  average_rating: number;
  created_at: string;
  updated_at: string;
  images?: RestaurantImage[];
  menu?: RestaurantMenuItem[];
  reviews?: RestaurantReview[];
  owner?: {
    business_name: string;
    verification_status: string;
    total_collaborations: number;
  };
}

export interface RestaurantImage {
  id: string;
  restaurant_id: string;
  image_url: string;
  image_type: string;
  caption: string | null;
  is_primary: boolean;
  display_order: number;
}

export interface RestaurantMenuItem {
  id: string;
  restaurant_id: string;
  category: string;
  item_name: string;
  description: string | null;
  dietary_tags: string[];
  image_url: string | null;
  is_signature_dish: boolean;
  is_available: boolean;
  display_order: number;
}

export interface RestaurantReview {
  id: string;
  restaurant_id: string;
  rating: number;
  food_quality: number | null;
  service_quality: number | null;
  ambiance_rating: number | null;
  review_text: string | null;
  would_recommend: boolean | null;
  created_at: string;
  reviewer_id: string;
}

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async (filters?: {
    search?: string;
    city?: string;
    cuisineTypes?: string[];
    priceRange?: string;
    dietaryOptions?: string[];
    mealTypes?: string[];
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('restaurants')
        .select(`
          *,
          images:restaurant_images(*),
          owner:restaurant_owners(business_name, verification_status, total_collaborations)
        `)
        .eq('is_active', true)
        .eq('admin_deactivated', false)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters?.cuisineTypes && filters.cuisineTypes.length > 0) {
        query = query.overlaps('cuisine_types', filters.cuisineTypes);
      }

      if (filters?.priceRange) {
        query = query.eq('price_range', filters.priceRange);
      }

      if (filters?.dietaryOptions && filters.dietaryOptions.length > 0) {
        query = query.overlaps('dietary_options', filters.dietaryOptions);
      }

      if (filters?.mealTypes && filters.mealTypes.length > 0) {
        query = query.overlaps('meal_types', filters.mealTypes);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRestaurants(data || []);
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          images:restaurant_images(*),
          menu:restaurant_menus(*),
          reviews:restaurant_reviews(*),
          owner:restaurant_owners(business_name, verification_status, total_collaborations)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to load restaurant details');
      return null;
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return {
    restaurants,
    loading,
    fetchRestaurants,
    getRestaurantById,
    refetch: fetchRestaurants
  };
};
