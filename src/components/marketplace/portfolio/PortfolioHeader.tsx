import { MapPin, Share2, CheckCircle2, Instagram, Music2, Youtube, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortfolioCreator } from './types';
import { toast } from '@/hooks/use-toast';
import FollowButton from '@/components/social/FollowButton';
import { useNavigate } from 'react-router-dom';

interface PortfolioHeaderProps {
  creator: PortfolioCreator;
  lastUpdated: string;
  creatorId: string;
  onMessageClick: () => void;
  isDemoMode?: boolean;
}

export const PortfolioHeader = ({ creator, lastUpdated, creatorId, onMessageClick, isDemoMode = false }: PortfolioHeaderProps) => {
  const navigate = useNavigate();
  const formatFollowers = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/creator/${creatorId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Profile link copied to clipboard",
    });
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar className="h-20 w-20 border-4 border-primary/20">
            <AvatarImage src={creator.avatar} alt={creator.name} />
            <AvatarFallback>{creator.name.substring(0, 2)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-3xl font-bold">{creator.name}</h1>
              <p className="text-muted-foreground">@{creator.handle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {creator.location}
              </div>
              
              <div className="flex gap-1">
                {creator.niches.slice(0, 3).map((niche) => (
                  <Badge key={niche} variant="secondary">
                    {niche}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {creator.platforms.instagram && (
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  <span className="font-semibold">
                    {formatFollowers(creator.platforms.instagram.followers)}
                  </span>
                  {creator.platforms.instagram.verified && (
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              )}

              {creator.platforms.tiktok && (
                <div className="flex items-center gap-2">
                  <Music2 className="h-4 w-4 text-cyan-500" />
                  <span className="font-semibold">
                    {formatFollowers(creator.platforms.tiktok.followers)}
                  </span>
                  {creator.platforms.tiktok.verified && (
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              )}

              {creator.platforms.youtube && (
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-500" />
                  <span className="font-semibold">
                    {formatFollowers(creator.platforms.youtube.followers)}
                  </span>
                  {creator.platforms.youtube.verified && (
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={() => { if (isDemoMode) { navigate('/auth'); return; } onMessageClick(); }}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            {isDemoMode ? (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                Follow
              </Button>
            ) : (
              <FollowButton
                userId={creatorId}
                size="sm"
                variant="outline"
              />
            )}
            <Button variant="outline" size="sm" onClick={() => { if (isDemoMode) { navigate('/auth'); return; } handleShare(); }}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
