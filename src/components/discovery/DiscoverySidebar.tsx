import { useEffect, useState } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import ConversationItem from './ConversationItem';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DiscoverySidebarProps {
  userId: string;
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}

const DiscoverySidebar = ({ 
  userId, 
  currentConversationId, 
  onNewChat,
  onSelectConversation 
}: DiscoverySidebarProps) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  // Auth state listener to ensure data isolation
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setConversations([]);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user?.id === userId) {
            fetchConversations();
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [userId]);

  // Refresh conversations when currentConversationId changes (new chat created)
  useEffect(() => {
    if (currentConversationId && userId) {
      fetchConversations();
    }
  }, [currentConversationId]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('discovery_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // Delete messages first
      const { error: messagesError } = await supabase
        .from('discovery_messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Delete conversation
      const { error: convError } = await supabase
        .from('discovery_conversations')
        .delete()
        .eq('id', conversationId);

      if (convError) throw convError;

      // Update local state
      setConversations(prev => prev.filter(c => c.id !== conversationId));

      // If deleted conversation was active, create new one
      if (conversationId === currentConversationId) {
        onNewChat();
      }

      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been removed',
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <Button 
          onClick={onNewChat} 
          className={cn(
            "w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          size="lg"
        >
          <Plus className="h-5 w-5" />
          {!isCollapsed && <span>New Chat</span>}
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="space-y-2 px-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No conversations yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start chatting to create your first conversation
                  </p>
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  {conversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={conversation.id === currentConversationId}
                      onClick={() => onSelectConversation(conversation.id)}
                      onDelete={() => handleDeleteConversation(conversation.id)}
                    />
                  ))}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DiscoverySidebar;
