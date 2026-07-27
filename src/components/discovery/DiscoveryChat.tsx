import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ChatMessage from './ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatMessage as ChatMessageType } from '@/hooks/useDiscoveryChat';

interface DiscoveryChatProps {
  messages: ChatMessageType[];
  streamingMessage: string;
  isLoading: boolean;
  isLoadingHistory: boolean;
  sendMessage: (content: string) => Promise<void> | void;
  clearChat: () => void;
}

const DiscoveryChat = ({
  messages,
  streamingMessage,
  isLoading,
  isLoadingHistory,
  sendMessage,
  clearChat,
}: DiscoveryChatProps) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleQuickAction = (message: string) => {
    if (!isLoading) {
      sendMessage(message);
    }
  };

  const quickActions = [
    { icon: '🔍', label: 'Browse creators', message: 'Show me all creators' },
    { icon: '💡', label: 'Content ideas', message: 'Give me travel content ideas for Instagram' },
    { icon: '🏠', label: 'View properties', message: 'Show me all available properties' },
    { icon: '🤝', label: 'Collaboration tips', message: 'How do I run a successful creator collaboration?' },
  ];

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Show loading state while conversation history loads
  if (isLoadingHistory) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-primary/5">
      {/* Quick Actions - Only show when no messages yet */}
      {messages.length <= 1 && !streamingMessage && (
        <div className="px-4 py-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-3">Quick actions to get started:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.message)}
                  disabled={isLoading}
                  className="justify-start text-left h-auto py-3 hover:bg-primary/5 hover:border-primary/50 transition-all"
                >
                  <span className="text-xl mr-2">{action.icon}</span>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6" ref={scrollRef}>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {/* Streaming message */}
          {streamingMessage && (
            <ChatMessage
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingMessage,
                timestamp: new Date(),
              }}
              isStreaming
            />
          )}

          {/* Loading indicator */}
          {isLoading && !streamingMessage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Hosty is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about creators, content ideas, or marketing strategies..."
                className="min-h-[52px] max-h-[200px] resize-none pr-12 bg-background"
                disabled={isLoading}
              />
              {messages.length > 1 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={clearChat}
                  className="absolute right-2 top-2 h-8 w-8"
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!input.trim() || isLoading}
              className="h-[52px] px-6"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send
                </>
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryChat;
