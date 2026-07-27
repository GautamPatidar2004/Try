import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/utils/logger';

export interface TrendInsights {
  content: string;
  disclaimer: string;
  topic: string;
  platform: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  creators?: any[];
  properties?: any[];
  brands?: any[];
  tool_calls?: any[];
  trendInsights?: TrendInsights;
  timestamp: Date;
}

export const useDiscoveryChat = (userId: string | null, userType: 'influencer' | 'host' | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "👋 Hi! I'm your AI Discovery Assistant. I can help you find perfect creator collaborations, provide content ideas, and offer marketing strategies.\n\nWhat would you like to explore today?",
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (userId) {
      loadOrCreateConversation();
    }
  }, [userId]);

  useEffect(() => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: "👋 Hi! I'm your AI Discovery Assistant. I can help you find perfect creator collaborations, provide content ideas, and offer marketing strategies.\n\nWhat would you like to explore today?",
      timestamp: new Date(),
    }]);
    setConversationId(null);
  }, [userId]);

  const loadOrCreateConversation = async () => {
    if (!userId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      logger.error('Session mismatch - user data isolation check failed');
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    try {
      const { data: conversations, error: fetchError } = await supabase
        .from('discovery_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (conversations && conversations.length > 0) {
        await loadConversation(conversations[0].id);
      } else {
        await createNewConversation();
      }
    } catch (error) {
      logger.error('Error loading conversation:', error);
      setIsLoadingHistory(false);
    }
  };

  const createNewConversation = async () => {
    if (!userId) return;

    try {
      const { data: newConv, error } = await supabase
        .from('discovery_conversations')
        .insert({
          user_id: userId,
          title: 'New Conversation',
        })
        .select()
        .single();

      if (error) throw error;

      setConversationId(newConv.id);
      setMessages([{
        id: '0',
        role: 'assistant',
        content: "👋 Hi! I'm your AI Discovery Assistant. I can help you find perfect creator collaborations, provide content ideas, and offer marketing strategies.\n\nWhat would you like to explore today?",
        timestamp: new Date(),
      }]);
      setIsLoadingHistory(false);
    } catch (error) {
      logger.error('Error creating conversation:', error);
      setIsLoadingHistory(false);
    }
  };

  const loadConversation = async (convId: string) => {
    setIsLoadingHistory(true);
    try {
      const { data: msgs, error } = await supabase
        .from('discovery_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setConversationId(convId);

      if (msgs && msgs.length > 0) {
        const loadedMessages: ChatMessage[] = msgs.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          creators: Array.isArray(msg.creators) ? msg.creators : undefined,
          properties: Array.isArray(msg.properties) ? msg.properties : undefined,
          brands: Array.isArray(msg.brands) ? msg.brands : undefined,
          tool_calls: Array.isArray(msg.tool_calls) ? msg.tool_calls : undefined,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      } else {
        setMessages([{
          id: '0',
          role: 'assistant',
          content: "👋 Hi! I'm your AI Discovery Assistant. I can help you find perfect creator collaborations, provide content ideas, and offer marketing strategies.\n\nWhat would you like to explore today?",
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      logger.error('Error loading conversation:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveMessage = async (message: ChatMessage) => {
    if (!conversationId || !userId) return;

    try {
      if (message.role === 'user') {
        const { data: existingMsgs } = await supabase
          .from('discovery_messages')
          .select('id')
          .eq('conversation_id', conversationId)
          .eq('role', 'user')
          .limit(1);

        if (!existingMsgs || existingMsgs.length === 0) {
          const title = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
          await supabase
            .from('discovery_conversations')
            .update({ title, updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        }
      }

      await supabase
        .from('discovery_messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          creators: message.creators || null,
          properties: message.properties || null,
          brands: message.brands || null,
          tool_calls: message.tool_calls || null,
        });

      await supabase
        .from('discovery_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } catch (error) {
      logger.error('Error saving message:', error);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingMessage('');

    await saveMessage(userMessage);

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
            messages: [...messages.map(m => ({
              role: m.role,
              content: m.content,
              tool_calls: m.tool_calls
            })), { role: 'user', content: content.trim() }],
            userId,
            userType,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMessage = '';
      let toolCalls: any[] = [];
      let pendingToolCalls: any = {};
      let creators: any[] = [];
      let properties: any[] = [];
      let brands: any[] = [];
      let trendInsights: TrendInsights | undefined = undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'creators' && parsed.creators) {
                creators = parsed.creators;
                continue;
              }

              if (parsed.type === 'properties' && parsed.properties) {
                properties = parsed.properties;
                continue;
              }

              if (parsed.type === 'brands' && parsed.brands) {
                brands = parsed.brands;
                continue;
              }

              if (parsed.type === 'trend_insights' && parsed.trendInsights) {
                trendInsights = parsed.trendInsights;
                continue;
              }
              
              const delta = parsed.choices?.[0]?.delta;

              if (delta?.content) {
                assistantMessage += delta.content;
                setStreamingMessage(assistantMessage);
              }

            if (delta?.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                const index = toolCall.index;
                
                if (!pendingToolCalls[index]) {
                  pendingToolCalls[index] = {
                    id: toolCall.id,
                    type: 'function',
                    function: {
                      name: toolCall.function?.name || '',
                      arguments: toolCall.function?.arguments || ''
                    }
                  };
                } else {
                  if (toolCall.function?.arguments) {
                    pendingToolCalls[index].function.arguments += toolCall.function.arguments;
                  }
                }
              }
            }

            if (parsed.choices?.[0]?.finish_reason === 'tool_calls') {
              toolCalls = Object.values(pendingToolCalls);
              
              for (const call of toolCalls) {
                try {
                  JSON.parse(call.function.arguments);
                } catch (e) {
                  logger.error('Error parsing tool arguments:', e);
                }
              }
            }
          } catch (e) {
            logger.error('Error parsing SSE:', e);
          }
        }
      }

      if (buffer.trim()) {
        const data = buffer.trim().slice(6);
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices?.[0]?.delta?.content) {
            assistantMessage += parsed.choices[0].delta.content;
          }
        } catch (e) {
          // Ignore parse errors for final buffer
        }
      }

      if (toolCalls.length > 0) {
        const assistantWithTools: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: assistantMessage || '',
          tool_calls: toolCalls,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantWithTools]);
        setStreamingMessage('');

        const toolResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/discovery-ai-chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              messages: [
                ...messages.map(m => ({
                  role: m.role,
                  content: m.content,
                  tool_calls: m.tool_calls
                })),
                { role: 'user', content: content.trim() },
                {
                  role: 'assistant',
                  content: assistantMessage || null,
                  tool_calls: toolCalls
                }
              ],
              userId,
              userType,
            }),
          }
        );

        if (!toolResponse.ok || !toolResponse.body) {
          throw new Error('Failed to get tool response');
        }

        const toolReader = toolResponse.body.getReader();
        let toolBuffer = '';
        let finalMessage = '';
        let toolResultCreators: any[] = [];
        let toolResultProperties: any[] = [];
        let toolResultBrands: any[] = [];
        let toolResultTrendInsights: TrendInsights | undefined = undefined;

        while (true) {
          const { done, value } = await toolReader.read();
          if (done) break;

          toolBuffer += decoder.decode(value, { stream: true });
          const lines = toolBuffer.split('\n');
          toolBuffer = lines.pop() || '';

          for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith(':')) continue;
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'creators' && parsed.creators) {
                toolResultCreators = parsed.creators;
                continue;
              }

              if (parsed.type === 'properties' && parsed.properties) {
                toolResultProperties = parsed.properties;
                continue;
              }

              if (parsed.type === 'brands' && parsed.brands) {
                toolResultBrands = parsed.brands;
                continue;
              }

              if (parsed.type === 'trend_insights' && parsed.trendInsights) {
                toolResultTrendInsights = parsed.trendInsights;
                continue;
              }
              
              const delta = parsed.choices?.[0]?.delta;

              if (delta?.content) {
                finalMessage += delta.content;
                setStreamingMessage(finalMessage);
              }
            } catch (e) {
              logger.error('Error parsing tool response:', e);
            }
          }
        }

        const finalAssistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: finalMessage,
          creators: toolResultCreators.length > 0 ? toolResultCreators : undefined,
          properties: toolResultProperties.length > 0 ? toolResultProperties : undefined,
          brands: toolResultBrands.length > 0 ? toolResultBrands : undefined,
          trendInsights: toolResultTrendInsights,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, finalAssistantMessage]);
        setStreamingMessage('');
        
        await saveMessage(finalAssistantMessage);
      } else {
        const assistantMessageObj: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: assistantMessage,
          creators: creators.length > 0 ? creators : undefined,
          properties: properties.length > 0 ? properties : undefined,
          brands: brands.length > 0 ? brands : undefined,
          trendInsights: trendInsights,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessageObj]);
        setStreamingMessage('');
        
        await saveMessage(assistantMessageObj);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      
      logger.error('Error in chat:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setStreamingMessage('');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, userId, userType, conversationId, saveMessage]);

  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: "👋 Hi! I'm your AI Discovery Assistant. I can help you find perfect creator collaborations, provide content ideas, and offer marketing strategies.\n\nWhat would you like to explore today?",
        timestamp: new Date(),
      }
    ]);
    setStreamingMessage('');
    setIsLoading(false);
    createNewConversation();
  }, [createNewConversation]);

  return {
    messages,
    streamingMessage,
    isLoading,
    isLoadingHistory,
    conversationId,
    sendMessage,
    clearChat,
    createNewConversation,
    loadConversation,
  };
};
