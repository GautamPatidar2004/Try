import { MapPin, Users, TrendingUp, Instagram, Youtube, Music, CheckCircle, Star, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CreatorCarouselCardProps {
  creator: {
    id: string;
    name: string;
    avatar_url?: string;
    location?: string;
    bio?: string;
    niches?: string[];
    followers?: number;
    engagement_rate?: number;
    match_score?: number;
    match_reasons?: string[];
    instagram_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    // Enhanced fields
    profile_strength?: number;
    collaboration_readiness?: string;
    rate_range?: string;
    is_top_pick?: boolean;
  };
  onClick: () => void;
}

const CreatorCarouselCard = ({ creator, onClick }: CreatorCarouselCardProps) => {
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

  const hasSocialLinks = creator.instagram_url || creator.tiktok_url || creator.youtube_url;
  
  const getReadinessColor = (readiness?: string) => {
    switch (readiness) {
      case 'Ready': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Needs setup': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-xl flex flex-col p-4 relative group",
        creator.is_top_pick && "ring-2 ring-primary/50 shadow-lg"
      )}
    >
      {/* Top Pick Badge */}
      {creator.is_top_pick && (
        <Badge 
          className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5"
        >
          <Star className="h-3 w-3 mr-1 fill-current" />
          Top Pick
        </Badge>
      )}

      {/* Match Score Badge */}
      {creator.match_score && !creator.is_top_pick && (
        <Badge 
          variant="secondary" 
          className="absolute top-3 right-3 bg-primary/10 text-primary border-primary/20 text-xs"
        >
          {creator.match_score}% Match
        </Badge>
      )}

      {/* Avatar & Name Section */}
      <div className="flex flex-col items-center mb-3 mt-2">
        <Avatar className={cn(
          "h-16 w-16 border-2 mb-2",
          creator.is_top_pick ? "border-primary" : "border-primary/20"
        )}>
          <AvatarImage src={creator.avatar_url} alt={creator.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
            {getInitials(creator.name)}
          </AvatarFallback>
        </Avatar>

        <h3 className="font-semibold text-base text-center leading-tight">
          {creator.name}
        </h3>

        {creator.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />
            {creator.location}
          </p>
        )}
      </div>

      {/* Collaboration Readiness Badge */}
      {creator.collaboration_readiness && (
        <div className="flex justify-center mb-2">
          <Badge 
            variant="outline" 
            className={cn("text-xs", getReadinessColor(creator.collaboration_readiness))}
          >
            {creator.collaboration_readiness === 'Ready' && <CheckCircle className="h-3 w-3 mr-1" />}
            {creator.collaboration_readiness}
          </Badge>
        </div>
      )}

      {/* Compact Stats Row */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-3">
        {creator.followers !== undefined && (
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">{formatNumber(creator.followers)}</span>
          </div>
        )}
        {creator.engagement_rate != null && (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">{creator.engagement_rate.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Rate Range */}
      {creator.rate_range && (
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
          <DollarSign className="h-3.5 w-3.5" />
          <span>{creator.rate_range}</span>
        </div>
      )}

      {/* Platform Icons */}
      {hasSocialLinks && (
        <div className="flex items-center justify-center gap-3 mb-3">
          {creator.instagram_url && <Instagram className="h-4 w-4 text-pink-500" />}
          {creator.tiktok_url && <Music className="h-4 w-4 text-foreground" />}
          {creator.youtube_url && <Youtube className="h-4 w-4 text-red-500" />}
        </div>
      )}

      {/* Bio Teaser */}
      {creator.bio && (
        <p className="text-xs text-muted-foreground text-center line-clamp-2 mb-3">
          {creator.bio}
        </p>
      )}

      {/* Match Reason Highlight */}
      {creator.match_reasons && creator.match_reasons.length > 0 && (
        <div className="bg-primary/5 border border-primary/10 rounded-md px-2 py-1.5 mb-3">
          <p className="text-xs text-primary font-medium line-clamp-1 text-center">
            ✨ {creator.match_reasons[0]}
          </p>
        </div>
      )}

      {/* Niches */}
      {creator.niches && creator.niches.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mb-3">
          {creator.niches.slice(0, 3).map((niche, index) => (
            <Badge key={index} variant="outline" className="text-xs px-2 py-0">
              {niche}
            </Badge>
          ))}
          {creator.niches.length > 3 && (
            <Badge variant="outline" className="text-xs px-2 py-0">
              +{creator.niches.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* View Profile CTA */}
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-auto opacity-0 group-hover:opacity-100 transition-opacity"
      >
        View Profile
      </Button>
    </Card>
  );
};

export default CreatorCarouselCard;
