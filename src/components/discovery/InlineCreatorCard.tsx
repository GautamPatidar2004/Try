import { useState } from 'react';
import { MapPin, Users, TrendingUp, Instagram, Youtube } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CreatorCard from '@/components/CreatorCard';

interface InlineCreatorCardProps {
  creator: {
    id: string;
    name: string;
    avatar_url?: string;
    location?: string;
    bio?: string;
    niches?: string[];
    followers?: number;
    engagement_rate?: number;
    instagram_url?: string;
    youtube_url?: string;
    match_score?: number;
    match_reasons?: string[];
  };
}

const InlineCreatorCard = ({ creator }: InlineCreatorCardProps) => {
  const [showFullCard, setShowFullCard] = useState(false);

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={creator.avatar_url} alt={creator.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(creator.name)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-lg leading-tight">{creator.name}</h3>
                {creator.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {creator.location}
                  </p>
                )}
              </div>
              {creator.match_score && (
                <Badge variant="secondary" className="shrink-0">
                  {creator.match_score}% Match
                </Badge>
              )}
            </div>

            {/* Bio */}
            {creator.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {creator.bio}
              </p>
            )}

            {/* Niches */}
            {creator.niches && creator.niches.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {creator.niches.slice(0, 3).map((niche, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {niche}
                  </Badge>
                ))}
                {creator.niches.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{creator.niches.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm mb-3">
              {creator.followers !== undefined && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{formatNumber(creator.followers)}</span>
                  <span className="text-xs">followers</span>
                </div>
              )}
              {creator.engagement_rate !== undefined && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">{creator.engagement_rate.toFixed(1)}%</span>
                  <span className="text-xs">engagement</span>
                </div>
              )}
            </div>

            {/* Social Links & Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                {creator.instagram_url && (
                  <a
                    href={creator.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {creator.youtube_url && (
                  <a
                    href={creator.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFullCard(true)}
                className="hover:bg-primary/5 hover:border-primary/50 transition-all"
              >
                View Full Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Creator Card Modal */}
      <Dialog open={showFullCard} onOpenChange={setShowFullCard}>
        <DialogContent className="max-w-2xl p-0">
          <CreatorCard
            creator={{
              id: creator.id,
              name: creator.name,
              avatar: creator.avatar_url,
              location: creator.location || 'Location not specified',
              followers: creator.followers || 0,
              rating: 4.5,
              specialties: creator.niches || [],
              engagementRate: creator.engagement_rate,
              instagramUrl: creator.instagram_url,
              youtubeUrl: creator.youtube_url,
            }}
            matchScore={creator.match_score}
            matchReasons={creator.match_reasons}
            showMatch={!!creator.match_score}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InlineCreatorCard;
