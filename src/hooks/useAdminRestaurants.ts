import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RestaurantFilters {
  search?: string;
  city?: string;
  country?: string;
  priceRange?: string;
  isActive?: boolean;
  featured?: boolean;
  minRating?: number;
}

export const useAdminRestaurants = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchRestaurants = async (filters?: RestaurantFilters) => {
    let query = supabase
      .from("restaurants")
      .select(`
        *,
        owner:owner_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }
    if (filters?.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }
    if (filters?.country) {
      query = query.eq("country", filters.country);
    }
    if (filters?.priceRange) {
      query = query.eq("price_range", filters.priceRange);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }
    if (filters?.featured !== undefined) {
      query = query.eq("featured", filters.featured);
    }
    if (filters?.minRating) {
      query = query.gte("average_rating", filters.minRating);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  const getRestaurantStats = async () => {
    const { data: restaurants, error } = await supabase
      .from("restaurants")
      .select("is_active, featured, average_rating");
    
    if (error) throw error;

    const { data: bookings } = await supabase
      .from("restaurant_bookings")
      .select("created_at")
      .gte("created_at", new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

    const totalRating = restaurants.reduce((sum, r) => sum + (r.average_rating || 0), 0);
    const avgRating = restaurants.length > 0 ? totalRating / restaurants.length : 0;

    return {
      total: restaurants.length,
      active: restaurants.filter(r => r.is_active).length,
      featured: restaurants.filter(r => r.featured).length,
      bookingsThisMonth: bookings?.length || 0,
      averageRating: avgRating,
    };
  };

  const getRestaurantById = async (id: string) => {
    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Fetch owner profile separately
    let owner = null;
    if (restaurant.owner_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, username")
        .eq("id", restaurant.owner_id)
        .single();
      
      owner = profile;
    }

    // Fetch images
    const { data: images } = await supabase
      .from("restaurant_images")
      .select("id, image_url, display_order")
      .eq("restaurant_id", id)
      .order("display_order");

    return { ...restaurant, owner, restaurant_images: images || [] };
  };

  const getRestaurantBookings = async (restaurantId: string) => {
    const { data, error } = await supabase
      .from("restaurant_bookings")
      .select(`
        *,
        influencer:influencer_id (
          id,
          first_name,
          last_name
        )
      `)
      .eq("restaurant_id", restaurantId)
      .order("booking_date", { ascending: false });

    if (error) throw error;
    return data;
  };

  const getRestaurantReviews = async (restaurantId: string) => {
    const { data, error } = await supabase
      .from("restaurant_reviews")
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          first_name,
          last_name
        )
      `)
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  const updateRestaurant = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("restaurants")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      toast({
        title: "Success",
        description: "Restaurant updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update restaurant: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("restaurants")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      toast({
        title: "Success",
        description: "Restaurant status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from("restaurants")
        .update({ featured })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      toast({
        title: "Success",
        description: "Featured status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update featured status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const adminDeactivate = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from("restaurants")
        .update({ 
          admin_deactivated: true,
          admin_notes: reason,
          is_active: false
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      toast({
        title: "Success",
        description: "Restaurant deactivated by admin",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to deactivate: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    fetchRestaurants,
    getRestaurantStats,
    getRestaurantById,
    getRestaurantBookings,
    getRestaurantReviews,
    updateRestaurant,
    toggleActive,
    toggleFeatured,
    adminDeactivate,
  };
};
