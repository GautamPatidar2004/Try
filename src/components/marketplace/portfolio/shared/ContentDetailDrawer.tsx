import { ContentItem } from '@/data/mockPortfolioData';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark, Eye, TrendingUp, ExternalLink, Star } from 'lucide-react';

interface ContentDetailDrawerProps {
  content: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFeatured?: (contentId: string) => void;
}

export const ContentDetailDrawer = ({
  content,
  isOpen,
  onClose,
  onToggleFeatured
}: ContentDetailDrawerProps) => {
  if (!content) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Content Details</SheetTitle>
            <Badge className={
              content.platform === 'instagram'
                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                : "bg-gradient-to-r from-cyan-500 to-pink-500"
            }>
              {content.platform === 'instagram' ? 'Instagram' : 'TikTok'}
            </Badge>
          </div>
          <SheetDescription>
            Posted on {new Date(content.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={content.thumbnail}
              alt={content.caption}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Caption</h3>
            <p className="text-sm text-muted-foreground">{content.caption}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {content.reach && (
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Reach</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(content.reach)}</p>
              </div>
            )}

            {content.impressions && (
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Impressions</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(content.impressions)}</p>
              </div>
            )}

            {content.views && (
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Views</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(content.views)}</p>
              </div>
            )}

            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Likes</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(content.likes)}</p>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Comments</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(content.comments)}</p>
            </div>

            {content.saves && (
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Saves</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(content.saves)}</p>
              </div>
            )}

            {content.shares && (
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Shares</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(content.shares)}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {onToggleFeatured && (
              <Button
                variant={content.featured ? "default" : "outline"}
                className="flex-1"
                onClick={() => onToggleFeatured(content.id)}
              >
                <Star className="h-4 w-4 mr-2" />
                {content.featured ? 'Remove from Featured' : 'Feature on Overview'}
              </Button>
            )}
            
            {content.permalink && (
              <Button variant="outline" className="flex-1" asChild>
                <a href={content.permalink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on {content.platform === 'instagram' ? 'Instagram' : 'TikTok'}
                </a>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
