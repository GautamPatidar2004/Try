import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { ApplicationMessageCard } from "./ApplicationMessageCard";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  application_id?: string | null;
  sender?: {
    first_name?: string;
    last_name?: string;
    profile_photo_url?: string;
  };
}

interface MessageThreadProps {
  userId: string;
  participantId: string;
  messages: Message[];
  onSendMessage: (receiverId: string, content: string, applicationId?: string) => Promise<void>;
}

const MessageThread = ({ userId, participantId, messages, onSendMessage }: MessageThreadProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(participantId, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const participantMessage = messages.find(m => m.sender_id === participantId);
  const participantName = participantMessage?.sender ? 
    `${participantMessage.sender.first_name || ''} ${participantMessage.sender.last_name || ''}`.trim() : 
    'Unknown User';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={participantMessage?.sender?.profile_photo_url} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(participantName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{participantName}</h3>
            <p className="text-sm text-muted-foreground">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isFromUser = message.sender_id === userId;
          const senderName = message.sender ? 
            `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() : 
            'Unknown User';

          if (message.application_id) {
            return (
              <ApplicationMessageCard
                key={message.id}
                applicationId={message.application_id}
                message={message}
                isFromUser={isFromUser}
                formatTime={formatMessageTime}
              />
            );
          }

          return (
            <div
              key={message.id}
              className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[70%] ${isFromUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isFromUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender?.profile_photo_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(senderName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`rounded-lg p-3 ${
                  isFromUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isFromUser 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="sm"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;