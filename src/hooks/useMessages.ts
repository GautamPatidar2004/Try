import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  application_id?: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    first_name?: string;
    last_name?: string;
    profile_photo_url?: string;
  };
  receiver?: {
    first_name?: string;
    last_name?: string;
    profile_photo_url?: string;
  };
}

interface Conversation {
  participant_id: string;
  participant_name: string;
  participant_photo?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  application_id?: string;
}

export const useMessages = (userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch conversations on mount and set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    fetchConversations();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`
        },
        () => {
          fetchConversations();
          if (activeConversation) {
            fetchMessages(activeConversation);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name, profile_photo_url),
          receiver:profiles!messages_receiver_id_fkey(first_name, last_name, profile_photo_url)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>();
      
      data?.forEach((message: any) => {
        const isFromUser = message.sender_id === userId;
        const partnerId = isFromUser ? message.receiver_id : message.sender_id;
        const partner = isFromUser ? message.receiver : message.sender;
        
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            participant_id: partnerId,
            participant_name: `${partner?.first_name || ''} ${partner?.last_name || ''}`.trim() || 'Unknown User',
            participant_photo: partner?.profile_photo_url,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0,
            application_id: message.application_id
          });
        }
        
        // Count unread messages
        if (!isFromUser && !message.is_read) {
          conversationMap.get(partnerId)!.unread_count++;
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (participantId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name, profile_photo_url),
          receiver:profiles!messages_receiver_id_fkey(first_name, last_name, profile_photo_url)
        `)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      
      // Mark messages as read
      await markAsRead(participantId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (receiverId: string, content: string, applicationId?: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          receiver_id: receiverId,
          content,
          application_id: applicationId
        });

      if (error) throw error;
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (senderId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', userId)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const selectConversation = (participantId: string) => {
    setActiveConversation(participantId);
    fetchMessages(participantId);
  };

  return {
    conversations,
    messages,
    loading,
    activeConversation,
    selectConversation,
    sendMessage,
    refetch: fetchConversations
  };
};