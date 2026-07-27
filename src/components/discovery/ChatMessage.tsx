import { Message } from '@/types/discovery';
import { Bot, User, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import CreatorCarousel from './CreatorCarousel';
import { PropertyCarousel } from './PropertyCarousel';
import { BrandCarousel } from './BrandCarousel';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

const ChatMessage = ({ message, isStreaming }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
          isUser
            ? 'bg-primary border-primary text-primary-foreground'
            : 'bg-secondary border-border text-secondary-foreground'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className={cn('flex-1 space-y-3', isUser && 'flex flex-col items-end')}>
        {/* Text Message */}
        <div
          className={cn(
            'rounded-lg px-4 py-3 max-w-[85%] break-words',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border',
            isStreaming && 'animate-pulse'
          )}
        >
          <ReactMarkdown
            className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
            components={{
              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
              em: ({node, ...props}) => <em className="italic" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="ml-2" {...props} />,
              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
              h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
          
          {/* Timestamp */}
          <div
            className={cn(
              'text-xs mt-2 opacity-70',
              isUser ? 'text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {/* Trend Insights Card */}
        {message.trendInsights && (
          <div className="w-full max-w-[95%] p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <TrendingUp className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-semibold text-purple-800 dark:text-purple-300 text-sm">
                Industry Insights
              </span>
              {message.trendInsights.platform && message.trendInsights.platform !== 'general' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 capitalize">
                  {message.trendInsights.platform}
                </span>
              )}
            </div>
            <div className="text-sm text-foreground">
              <ReactMarkdown
                className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-purple-800 dark:prose-headings:text-purple-300 prose-strong:text-purple-700 dark:prose-strong:text-purple-400"
                components={{
                  strong: ({node, ...props}) => <strong className="font-bold text-purple-700 dark:text-purple-400" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
                  li: ({node, ...props}) => <li className="ml-2" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-base font-bold mb-2 text-purple-800 dark:text-purple-300" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-sm font-bold mb-2 text-purple-800 dark:text-purple-300" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm font-semibold mb-1 text-purple-700 dark:text-purple-400" {...props} />,
                }}
              >
                {message.trendInsights.content}
              </ReactMarkdown>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic border-t border-purple-200 dark:border-purple-800 pt-2">
              📊 {message.trendInsights.disclaimer}
            </p>
          </div>
        )}

        {/* Creator Carousel */}
        {message.creators && message.creators.length > 0 && (
          <div className="w-full">
            <CreatorCarousel creators={message.creators} />
          </div>
        )}

        {/* Property Carousel */}
        {message.properties && message.properties.length > 0 && (
          <div className="w-full">
            <PropertyCarousel properties={message.properties} />
          </div>
        )}

        {/* Brand Carousel */}
        {message.brands && message.brands.length > 0 && (
          <div className="w-full">
            <BrandCarousel brands={message.brands} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
