import { motion } from 'framer-motion';
import { MapPin, Users, Star, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import MatchBadge from '@/components/ai-matching/MatchBadge';
import MatchReasons from '@/components/ai-matching/MatchReasons';

interface MatchCardProps {
  data: any;
  userType: 'influencer' | 'host';
  onDragEnd?: (info: any) => void;
}

const MatchCard = ({ data, userType, onDragEnd }: MatchCardProps) => {
  const isInfluencerView = userType === 'influencer';
  const property = data.property;
  const influencer = data.influencer;
  const matchScore = data.match_score || 0;
  const matchReasons = data.match_reasons || [];

  const imageUrl = isInfluencerView
    ? property?.property_images?.[0]?.image_url || '/placeholder.svg'
    : influencer?.profile_photo_url || '/placeholder.svg';

  const title = isInfluencerView ? property?.title : influencer?.first_name + ' ' + influencer?.last_name;
  const location = isInfluencerView ? property?.location : influencer?.location;

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => onDragEnd?.(info)}
      whileDrag={{ scale: 1.05, rotate: 2 }}
      whileTap={{ scale: 1.02 }}
      className="absolute inset-0"
    >
      <Card className="h-full w-full max-h-[700px] overflow-hidden bg-card shadow-xl border-2 border-border/50 flex flex-col">
        {/* Header with Match Score */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          <MatchBadge score={matchScore} className="shadow-xl" />
          <div className="bg-background/90 backdrop-blur-sm rounded-full p-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>

        {/* Main Image */}
        <div className="relative h-2/5 flex-shrink-0 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-6 space-y-4 scrollbar-hide">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1 line-clamp-2">{title}</h2>
            {location && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm line-clamp-1">{location}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          {isInfluencerView && property && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5 bg-secondary/50 rounded-full px-3 py-1.5">
                <Users className="h-4 w-4" />
                <span>{property.max_guests} guests</span>
              </div>
              {property.bedrooms && (
                <div className="bg-secondary/50 rounded-full px-3 py-1.5">
                  <span>{property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

          {!isInfluencerView && influencer && (
            <div className="flex items-center gap-2 text-sm bg-secondary/50 rounded-full px-3 py-1.5 w-fit">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-foreground font-medium">{influencer.influencers?.total_followers?.toLocaleString() || '0'} followers</span>
            </div>
          )}

          {/* Match Reasons */}
          {matchReasons.length > 0 && (
            <div className="pt-2">
              <MatchReasons 
                reasons={matchReasons} 
                recommendation={data.ai_recommendation || ''} 
              />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default MatchCard;
