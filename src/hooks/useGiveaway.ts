import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GiveawayEntry {
  name: string;
  email: string;
  phone?: string;
  instagram_username?: string;
  age_verified: boolean;
  us_resident: boolean;
  shared_to_story?: boolean;
  terms_agreed: boolean;
}

export const useGiveaway = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('giveaway_entries')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking email:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const addEntry = async (entry: GiveawayEntry) => {
    setIsSubmitting(true);
    
    try {
      // Check if email already exists
      const exists = await checkEmailExists(entry.email);
      
      if (exists) {
        toast({
          title: "Already Entered",
          description: "This email has already been entered in the giveaway.",
          variant: "destructive",
        });
        return { success: false, error: 'Email already exists' };
      }

      // Validate required fields
      if (!entry.age_verified || !entry.us_resident || !entry.terms_agreed) {
        toast({
          title: "Eligibility Required",
          description: "You must be 18+, a US resident, and agree to terms to enter.",
          variant: "destructive",
        });
        return { success: false, error: 'Eligibility requirements not met' };
      }

      // Insert the entry
      const { data, error } = await supabase
        .from('giveaway_entries')
        .insert([
          {
            name: entry.name,
            email: entry.email,
            phone: entry.phone || null,
            instagram_username: entry.instagram_username || null,
            age_verified: entry.age_verified,
            us_resident: entry.us_resident,
            shared_to_story: entry.shared_to_story || false,
            terms_agreed: entry.terms_agreed,
            entry_source: 'website',
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding entry:', error);
        toast({
          title: "Error",
          description: "Failed to submit entry. Please try again.",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Entry Submitted! 🎉",
        description: "Good luck! Winner announced 10/31 via Instagram Live.",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error submitting entry:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: 'Unexpected error' };
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEntryCount = async (): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('giveaway_entries')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting entry count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting entry count:', error);
      return 0;
    }
  };

  return {
    addEntry,
    checkEmailExists,
    getEntryCount,
    isSubmitting,
  };
};
