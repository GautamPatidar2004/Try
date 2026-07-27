import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioPostCardProps {
  mediaUrl: string;
  mediaType: string;
  likesCount: number;
  viewsCount: number;
  caption?: string;
  propertyTitle?: string;
  platform?: string;
  performanceBadge?: {
    label: string;
    color: string;
  } | null;
  onClick?: () => void;
}

export const PortfolioPostCard = ({
  mediaUrl,
  mediaType,
  likesCount,
  viewsCount,
  caption,
  propertyTitle,
  platform,
  performanceBadge,
  onClick,
}: PortfolioPostCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  const getPlatformFromUrl = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.includes('instagram')) return 'Instagram';
    if (lower.includes('tiktok')) return 'TikTok';
    if (lower.includes('youtube')) return 'YouTube';
    if (lower.includes('twitter')) return 'Twitter';
    return platform || 'Other';
  };

  const displayPlatform = getPlatformFromUrl(mediaUrl);

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Media */}
      <div className="aspect-square relative bg-muted">
        {mediaType === 'video' ? (
          <video
            src={mediaUrl}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={mediaUrl}
            alt={caption || 'Post'}
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay on hover */}
        <div
          className={cn(
            'absolute inset-0 bg-black/60 transition-opacity duration-200 flex items-center justify-center',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="text-white space-y-3">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-white" />
                <span className="text-lg font-semibold">{formatNumber(likesCount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span className="text-lg font-semibold">{formatNumber(viewsCount)}</span>
              </div>
            </div>
            {caption && (
              <p className="text-xs text-center px-4 line-clamp-2">{caption}</p>
            )}
          </div>
        </div>

        {/* Performance Badge */}
        {performanceBadge && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className={cn('text-xs', performanceBadge.color)}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {performanceBadge.label}
            </Badge>
          </div>
        )}

        {/* Platform Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="default" className="text-xs">
            {displayPlatform}
          </Badge>
        </div>

        {/* Property Title */}
        {propertyTitle && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="text-xs bg-black/50 text-white border-none">
              {propertyTitle}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};
