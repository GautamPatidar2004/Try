import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/hooks/useMessages";
import { useIsMobile } from "@/hooks/use-mobile";
import MessageThread from "./MessageThread";

interface MessageInboxProps {
  userId: string;
  initialConversationId?: string;
}

const MessageInbox = ({ userId, initialConversationId }: MessageInboxProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();
  const { conversations, messages, loading, activeConversation, selectConversation, sendMessage } = useMessages(userId);

  useEffect(() => {
    if (initialConversationId && !loading && conversations.length > 0) {
      selectConversation(initialConversationId);
    }
  }, [initialConversationId, loading, conversations.length]);

  const filteredConversations = conversations.filter(conv =>
    conv.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleBack = () => {
    selectConversation('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Mobile: show either conversation list OR thread, not both
  if (isMobile) {
    if (activeConversation) {
      return (
        <div className="flex flex-col w-full h-[calc(100vh-180px)] min-h-[400px] border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b bg-card">
            <Button variant="ghost" size="sm" onClick={handleBack} className="p-1 min-h-[44px] min-w-[44px]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="font-medium text-sm">Back to messages</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <MessageThread
              userId={userId}
              participantId={activeConversation}
              messages={messages}
              onSendMessage={sendMessage}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full h-[calc(100vh-180px)] min-h-[400px] border rounded-lg overflow-hidden bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.participant_id}
                onClick={() => selectConversation(conversation.participant_id)}
                className="p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted min-h-[64px]"
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversation.participant_photo} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(conversation.participant_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">
                        {conversation.participant_name}
                      </h4>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {conversation.unread_count > 0 && (
                          <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(conversation.last_message_time)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conversation.last_message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Desktop: side-by-side layout
  return (
    <div className="flex w-full h-[calc(100vh-250px)] min-h-[500px] max-h-[800px] border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="min-w-[280px] w-80 max-w-[320px] border-r bg-card flex-shrink-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.participant_id}
                onClick={() => selectConversation(conversation.participant_id)}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  activeConversation === conversation.participant_id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversation.participant_photo} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(conversation.participant_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">
                        {conversation.participant_name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {conversation.unread_count > 0 && (
                          <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(conversation.last_message_time)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conversation.last_message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-hidden">
        {activeConversation ? (
          <MessageThread
            userId={userId}
            participantId={activeConversation}
            messages={messages}
            onSendMessage={sendMessage}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium text-muted-foreground">Select a conversation</h3>
              <p className="text-sm text-muted-foreground/70">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInbox;
