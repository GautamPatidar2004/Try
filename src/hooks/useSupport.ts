import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SupportCategory, FAQ, SupportTicket, CreateTicketData } from '@/types/support';
import { useToast } from '@/hooks/use-toast';

export const useSupport = () => {
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('support_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load support categories",
        variant: "destructive",
      });
    }
  };

  const fetchFAQs = async (categoryId?: string, searchTerm?: string) => {
    try {
      let query = supabase
        .from('faq')
        .select(`
          *,
          category:support_categories(*)
        `)
        .eq('is_active', true)
        .order('display_order');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (searchTerm) {
        query = query.or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to load FAQs",
        variant: "destructive",
      });
    }
  };

  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          category:support_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data || []) as SupportTicket[]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: CreateTicketData) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a support ticket",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          ...ticketData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Support ticket created successfully",
      });

      await fetchUserTickets();
      return data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create support ticket",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchFAQs = async (searchTerm: string) => {
    await fetchFAQs(undefined, searchTerm);
  };

  useEffect(() => {
    fetchCategories();
    fetchFAQs();
  }, []);

  return {
    categories,
    faqs,
    tickets,
    loading,
    fetchCategories,
    fetchFAQs,
    fetchUserTickets,
    createTicket,
    searchFAQs,
  };
};