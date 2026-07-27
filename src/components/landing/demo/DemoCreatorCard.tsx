import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Instagram, Users } from "lucide-react";

interface Creator {
  id: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    profile_photo_url?: string;
    location?: string;
  };
  content_niches?: string[];
  total_followers?: number;
  engagement_rate?: number;
}

interface DemoCreatorCardProps {
  creator: Creator;
  onInteraction: () => void;
}

export const DemoCreatorCard = ({ creator, onInteraction }: DemoCreatorCardProps) => {
  const profile = creator.profiles;
  const name = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : 'Creator';
  
  const formatFollowers = (count?: number) => {
    if (!count) return '—';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Card 
      className="p-3 min-w-[180px] max-w-[180px] cursor-pointer hover:bg-accent/50 transition-colors border-border/50"
      onClick={onInteraction}
    >
      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-14 w-14">
          <AvatarImage src={profile?.profile_photo_url || ''} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center space-y-1">
          <p className="font-medium text-sm text-foreground truncate max-w-full">{name}</p>
          {profile?.location && (
            <p className="text-xs text-muted-foreground truncate">{profile.location}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{formatFollowers(creator.total_followers)}</span>
          {creator.engagement_rate && (
            <>
              <span>•</span>
              <span>{creator.engagement_rate.toFixed(1)}%</span>
            </>
          )}
        </div>

        {creator.content_niches && creator.content_niches.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {creator.content_niches.slice(0, 2).map((niche, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                {niche}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
