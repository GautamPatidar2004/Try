import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BookingData {
  restaurant_id: string;
  booking_date: string;
  booking_time: string;
  party_size: number;
  meal_type: string;
  collaboration_type: string;
  content_deliverables?: string[];
  content_deadline?: string;
  proposed_rate?: number;
  proposal_message?: string;
  special_requests?: string;
}

export const useRestaurantBooking = () => {
  const [loading, setLoading] = useState(false);

  const createBooking = async (bookingData: BookingData) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to book');
        return null;
      }

      // Validate 24-hour minimum (trigger will also validate)
      const bookingDateTime = new Date(`${bookingData.booking_date}T${bookingData.booking_time}`);
      const now = new Date();
      const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilBooking < 24) {
        toast.error('Bookings must be made at least 24 hours in advance');
        return null;
      }

      const { data, error } = await supabase
        .from('restaurant_bookings')
        .insert([{
          ...bookingData,
          influencer_id: user.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Booking request submitted! The restaurant owner will review your request.');
      return data;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Failed to create booking');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: 'approved' | 'declined' | 'completed' | 'cancelled' | 'no_show',
    reason?: string
  ) => {
    try {
      setLoading(true);

      const updateData: any = { status };

      if (status === 'declined' && reason) {
        updateData.decline_reason = reason;
      }

      if (status === 'cancelled' && reason) {
        updateData.cancellation_reason = reason;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) updateData.cancelled_by = user.id;
      }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('restaurant_bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Booking ${status} successfully`);
      return data;
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMyBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('restaurant_bookings')
        .select(`
          *,
          restaurant:restaurants(*)
        `)
        .eq('influencer_id', user.id)
        .order('booking_date', { ascending: false });

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
    createBooking,
    updateBookingStatus,
    getMyBookings
  };
};
