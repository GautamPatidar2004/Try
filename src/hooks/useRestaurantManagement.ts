import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Restaurant } from './useRestaurants';

export const useRestaurantManagement = () => {
  const [loading, setLoading] = useState(false);

  const createRestaurant = async (restaurantData: any) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return null;
      }

      const { data, error } = await supabase
        .from('restaurants')
        .insert([{
          ...restaurantData,
          owner_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Restaurant created successfully!');
      return data;
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      toast.error('Failed to create restaurant');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (restaurantId: string, updates: Partial<Restaurant>) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurantId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Restaurant updated successfully!');
      return data;
    } catch (error: any) {
      console.error('Error updating restaurant:', error);
      toast.error('Failed to update restaurant');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadRestaurantImage = async (restaurantId: string, file: File, imageType: string = 'general') => {
    try {
      setLoading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurantId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('restaurant_images')
        .insert([{
          restaurant_id: restaurantId,
          image_url: publicUrl,
          image_type: imageType,
          display_order: 0
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Image uploaded successfully!');
      return data;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (menuItem: {
    restaurant_id: string;
    category: string;
    item_name: string;
    description?: string;
    dietary_tags?: string[];
    image_url?: string;
    is_signature_dish?: boolean;
  }) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('restaurant_menus')
        .insert([menuItem])
        .select()
        .single();

      if (error) throw error;

      toast.success('Menu item added!');
      return data;
    } catch (error: any) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async (menuItemId: string, updates: any) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('restaurant_menus')
        .update(updates)
        .eq('id', menuItemId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Menu item updated!');
      return data;
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (menuItemId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('restaurant_menus')
        .delete()
        .eq('id', menuItemId);

      if (error) throw error;

      toast.success('Menu item deleted!');
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const getOwnerBookings = async (restaurantId: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurant_bookings')
        .select(`
          *,
          influencer:influencers(
            id,
            user_id,
            follower_count,
            engagement_rate
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      return [];
    }
  };

  return {
    loading,
    createRestaurant,
    updateRestaurant,
    uploadRestaurantImage,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getOwnerBookings
  };
};
