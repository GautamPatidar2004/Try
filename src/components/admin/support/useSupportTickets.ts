import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SupportTicket, SupportTicketMessage } from '@/types/support';

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Fetch tickets with categories
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          category:support_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      if (!ticketsData || ticketsData.length === 0) {
        setTickets([]);
        return;
      }

      // Extract unique user IDs
      const userIds = [...new Set(ticketsData.map(ticket => ticket.user_id))];

      // Fetch profiles for these user IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );

      // Combine tickets with user profiles
      const ticketsWithProfiles = ticketsData.map(ticket => ({
        ...ticket,
        user: profilesMap.get(ticket.user_id) || null
      }));

      setTickets(ticketsWithProfiles as SupportTicket[]);
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

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {})
        })
        .eq('id', ticketId);

      if (error) throw error;

      await fetchTickets();
      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const updateTicketPriority = async (ticketId: string, priority: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      await fetchTickets();
      toast({
        title: "Success",
        description: "Ticket priority updated successfully",
      });
    } catch (error) {
      console.error('Error updating ticket priority:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket priority",
        variant: "destructive",
      });
    }
  };

  const assignTicket = async (ticketId: string, adminId: string | null) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          assigned_admin_id: adminId,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      await fetchTickets();
      toast({
        title: "Success",
        description: adminId ? "Ticket assigned successfully" : "Ticket unassigned successfully",
      });
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      });
    }
  };

  const replyToTicket = async (ticketId: string, message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_admin_reply: true
        });

      if (error) throw error;

      // Update ticket status to in_progress if it's currently open
      await supabase
        .from('support_tickets')
        .update({ 
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .eq('status', 'open');

      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
    } catch (error) {
      console.error('Error replying to ticket:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  const fetchTicketMessages = async (ticketId: string): Promise<SupportTicketMessage[]> => {
    try {
      // Fetch messages first
      const { data: messagesData, error: messagesError } = await supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        return [];
      }

      // Extract unique user IDs from messages
      const userIds = [...new Set(messagesData.map(message => message.user_id))];

      // Fetch profiles for these user IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );

      // Combine messages with user profiles
      const messagesWithProfiles = messagesData.map(message => ({
        ...message,
        user: profilesMap.get(message.user_id) || null
      }));

      return messagesWithProfiles;
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchTickets();

    // Set up real-time subscription
    const channel = supabase
      .channel('support_tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tickets,
    loading,
    fetchTickets,
    updateTicketStatus,
    updateTicketPriority,
    assignTicket,
    replyToTicket,
    fetchTicketMessages,
  };
};