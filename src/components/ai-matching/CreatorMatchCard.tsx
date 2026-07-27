import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, MessageCircle } from "lucide-react";
import { useState } from "react";
import MatchBadge from "./MatchBadge";
import MatchReasons from "./MatchReasons";
import CreatorProfileModal from "@/components/marketplace/CreatorProfileModal";
import StartConversationModal from "@/components/marketplace/StartConversationModal";

interface CreatorMatchCardProps {
  creator: {
    id: string;
    name: string;
    avatar?: string;
    location?: string;
    followers: number;
    specialties?: string[];
  };
  matchScore: number;
  matchReasons: string[];
  aiRecommendation: string;
  propertyTitle: string;
}

const CreatorMatchCard = ({ 
  creator, 
  matchScore, 
  matchReasons, 
  aiRecommendation,
  propertyTitle 
}: CreatorMatchCardProps) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-14 w-14">
                <AvatarImage src={creator.avatar} alt={creator.name} />
                <AvatarFallback>{creator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{creator.name}</h3>
                {creator.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{creator.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{formatFollowers(creator.followers)} followers</span>
                </div>
              </div>
            </div>
            <MatchBadge score={matchScore} />
          </div>

          {creator.specialties && creator.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {creator.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Perfect match for: {propertyTitle}
            </p>
          </div>

          <MatchReasons reasons={matchReasons} recommendation={aiRecommendation} />

          <div className="flex gap-2 mt-4">
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => setShowProfileModal(true)}
            >
              View Profile
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowMessageModal(true)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreatorProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onConnect={() => setShowMessageModal(true)}
        creator={{
          id: creator.id,
          name: creator.name,
          avatar: creator.avatar || '',
          location: creator.location || '',
          followers: creator.followers,
          rating: 0,
          specialties: creator.specialties || [],
          priceRange: '',
          recentWork: [],
          userId: creator.id,
        }}
      />

      <StartConversationModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        creator={{
          id: creator.id,
          name: creator.name,
          avatar: creator.avatar || '',
          location: creator.location || '',
          followers: creator.followers,
          rating: 0,
          specialties: creator.specialties || [],
          priceRange: '',
          recentWork: [],
          userId: creator.id,
        }}
      />
    </>
  );
};

export default CreatorMatchCard;
