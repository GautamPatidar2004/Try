import { useState } from 'react';
import { ContentItem } from '@/data/mockPortfolioData';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark, Eye, TrendingUp, Instagram, Play, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentGalleryGridProps {
  content: ContentItem[];
  onContentClick: (content: ContentItem) => void;
}

export const ContentGalleryGrid = ({ content, onContentClick }: ContentGalleryGridProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set(prev).add(id));
  };

  const shouldShowPlaceholder = (item: ContentItem) => {
    return !item.thumbnail || item.thumbnail === '' || imageErrors.has(item.id);
  };

  const handleClick = (item: ContentItem) => {
    // If we have a permalink, open it in a new tab
    if (item.permalink) {
      window.open(item.permalink, '_blank', 'noopener,noreferrer');
    } else {
      onContentClick(item);
    }
  };

  if (content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Instagram className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No content available</p>
        <p className="text-sm">Sync your Instagram account to display your posts</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {content.map((item) => (
        <div
          key={item.id}
          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => handleClick(item)}
        >
          {shouldShowPlaceholder(item) ? (
            // Instagram-branded placeholder when no image available
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex flex-col items-center justify-center">
              <Instagram className="h-10 w-10 text-white mb-2" />
              <div className="flex items-center gap-3 text-white text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {formatNumber(item.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {formatNumber(item.comments)}
                </span>
              </div>
              {item.type === 'reel' && (
                <div className="absolute top-2 right-2">
                  <Play className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="absolute bottom-2 right-2">
                <ExternalLink className="h-4 w-4 text-white/70" />
              </div>
            </div>
          ) : (
            <img
              src={item.thumbnail}
              alt={item.caption || 'Instagram post'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => handleImageError(item.id)}
            />
          )}
          
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge variant="secondary" className={cn(
              "text-xs",
              item.platform === 'instagram' && "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
              item.platform === 'tiktok' && "bg-gradient-to-r from-cyan-500 to-pink-500 text-white"
            )}>
              {item.platform === 'instagram' ? 'IG' : 'TT'}
            </Badge>
            
            {item.featured && (
              <Badge variant="default" className="text-xs">
                Featured
              </Badge>
            )}
          </div>

          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "flex flex-col justify-end p-4"
          )}>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-white text-xs">
                {item.reach && item.reach > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{formatNumber(item.reach)}</span>
                  </div>
                )}
                {item.views && item.views > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{formatNumber(item.views)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{formatNumber(item.likes)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{formatNumber(item.comments)}</span>
                </div>
                {item.saves && item.saves > 0 && (
                  <div className="flex items-center gap-1">
                    <Bookmark className="h-3 w-3" />
                    <span>{formatNumber(item.saves)}</span>
                  </div>
                )}
                {item.shares && item.shares > 0 && (
                  <div className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    <span>{formatNumber(item.shares)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
