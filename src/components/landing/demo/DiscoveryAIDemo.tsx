import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Search, Building, Users, Lightbulb, Loader2 } from "lucide-react";
import { AISignupPrompt } from "./AISignupPrompt";
import { DemoResultsSection } from "./DemoResultsSection";
import { motion } from "framer-motion";

interface DemoMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  creators?: any[];
  properties?: any[];
  brands?: any[];
}

type SignupContext = 'search' | 'view_creator' | 'view_property' | 'view_brand' | 'continue_chat';

export const DiscoveryAIDemo = () => {
  const [inputValue, setInputValue] = useState("");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupContext, setSignupContext] = useState<SignupContext>('search');
  const [userQuery, setUserQuery] = useState("");
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    creators?: any[];
    properties?: any[];
    brands?: any[];
  }>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const quickActions = [
    { icon: Search, label: "Browse creators", query: "Show me travel creators" },
    { icon: Building, label: "View properties", query: "Find luxury properties" },
    { icon: Users, label: "Find brands", query: "Show brand campaigns" },
    { icon: Lightbulb, label: "Get ideas", query: "Give me collaboration ideas" },
  ];

  const performDemoSearch = async (query: string) => {
    setIsLoading(true);
    setStreamingMessage("");
    setSearchResults({});

    // Add user message
    const userMessage: DemoMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/discovery-ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: query }],
            userId: null,
            userType: null,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let accumulatedText = "";
      let resultCreators: any[] = [];
      let resultProperties: any[] = [];
      let resultBrands: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonStr);
              
              if (data.type === 'creators' && data.data) {
                resultCreators = data.data;
                setSearchResults(prev => ({ ...prev, creators: data.data }));
              } else if (data.type === 'properties' && data.data) {
                resultProperties = data.data;
                setSearchResults(prev => ({ ...prev, properties: data.data }));
              } else if (data.type === 'brands' && data.data) {
                resultBrands = data.data;
                setSearchResults(prev => ({ ...prev, brands: data.data }));
              } else if (data.content) {
                accumulatedText += data.content;
                setStreamingMessage(accumulatedText);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Finalize message
      const assistantMessage: DemoMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: accumulatedText || "I found some great options for you! Click on any card to learn more.",
        creators: resultCreators,
        properties: resultProperties,
        brands: resultBrands,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage("");
      setHasUsedFreeTrial(true);

    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      
      console.error('Demo search error:', error);
      const errorMessage: DemoMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Sign up to get full access to Hosty!",
      };
      setMessages(prev => [...prev, errorMessage]);
      setHasUsedFreeTrial(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (query: string) => {
    if (!query.trim()) return;

    if (hasUsedFreeTrial) {
      setUserQuery(query);
      setSignupContext('continue_chat');
      setShowSignupPrompt(true);
      return;
    }

    performDemoSearch(query);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim() && !isLoading) {
      handleSubmit(inputValue);
    }
  };

  const handleQuickAction = (query: string) => {
    if (hasUsedFreeTrial) {
      setUserQuery(query);
      setSignupContext('continue_chat');
      setShowSignupPrompt(true);
      return;
    }

    performDemoSearch(query);
  };

  const handleResultInteraction = (type: 'creator' | 'property' | 'brand') => {
    setSignupContext(type === 'creator' ? 'view_creator' : type === 'property' ? 'view_property' : 'view_brand');
    setShowSignupPrompt(true);
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <>
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg">
        {/* Chat Header */}
        <div className="bg-primary/5 border-b border-border px-4 py-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">Hosty</p>
            <p className="text-xs text-muted-foreground">AI Discovery Assistant</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-4 space-y-4 min-h-[200px] max-h-[400px] overflow-y-auto">
          {/* AI Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-3 flex-1">
              <div className="bg-muted/50 rounded-lg rounded-tl-none p-3 text-sm text-foreground">
                <p>Hi! 👋 I'm <strong>Hosty</strong>, your AI discovery assistant.</p>
                <p className="mt-2 text-muted-foreground">
                  I can help you find the perfect creators, properties, and brand partnerships. 
                  What are you looking for today?
                </p>
              </div>

              {/* Quick Actions - only show if no messages yet */}
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5 hover:bg-primary/5 hover:border-primary/30"
                        onClick={() => handleQuickAction(action.query)}
                      >
                        <action.icon className="h-3 w-3" />
                        {action.label}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* User & Assistant Messages */}
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                <div className={`rounded-lg p-3 text-sm ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                    : 'bg-muted/50 text-foreground rounded-tl-none'
                }`}>
                  {message.content}
                </div>
                
                {/* Results Section */}
                {message.role === 'assistant' && (message.creators?.length || message.properties?.length || message.brands?.length) && (
                  <DemoResultsSection
                    creators={message.creators}
                    properties={message.properties}
                    brands={message.brands}
                    onInteraction={() => handleResultInteraction(
                      message.creators?.length ? 'creator' : 
                      message.properties?.length ? 'property' : 'brand'
                    )}
                  />
                )}
              </div>
            </motion.div>
          ))}

          {/* Streaming Message */}
          {(isLoading || streamingMessage) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="bg-muted/50 rounded-lg rounded-tl-none p-3 text-sm text-foreground">
                  {streamingMessage || (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Searching...</span>
                    </div>
                  )}
                </div>
                
                {/* Live Results while streaming */}
                {(searchResults.creators?.length || searchResults.properties?.length || searchResults.brands?.length) && (
                  <DemoResultsSection
                    creators={searchResults.creators}
                    properties={searchResults.properties}
                    brands={searchResults.brands}
                    onInteraction={() => handleResultInteraction(
                      searchResults.creators?.length ? 'creator' : 
                      searchResults.properties?.length ? 'property' : 'brand'
                    )}
                  />
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-3 bg-background/50">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about creators, properties, brands..."
              className="flex-1 bg-background"
              disabled={isLoading}
            />
            <Button 
              size="icon"
              onClick={() => handleSubmit(inputValue)}
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            {hasUsedFreeTrial 
              ? "Sign up to continue chatting with Hosty" 
              : "Try one free search - press Enter or click Send"}
          </p>
        </div>
      </div>

      <AISignupPrompt
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        userQuery={userQuery}
        context={signupContext}
      />
    </>
  );
};
