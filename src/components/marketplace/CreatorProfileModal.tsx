import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Instagram, Users, MapPin, Star, MessageCircle, ExternalLink } from "lucide-react";

interface Creator {
  id: string;
  name: string;
  avatar: string;
  location: string;
  followers: number;
  rating: number;
  specialties: string[];
  recentWork: string[];
  priceRange: string;
  userId: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
}

interface CreatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator;
  onConnect: () => void;
}

const CreatorProfileModal = ({ isOpen, onClose, creator, onConnect }: CreatorProfileModalProps) => {
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleConnect = () => {
    onClose();
    onConnect();
  };

  const handleViewInstagram = () => {
    if (creator.instagramUrl) {
      window.open(creator.instagramUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Creator Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Creator Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback className="bg-gradient-to-br from-brand-green to-emerald-500 text-white text-xl">
                {creator.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{creator.name}</h2>
              <div className="flex items-center text-muted-foreground mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{creator.location}</span>
              </div>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-muted-foreground" />
                  <span className="font-semibold">{formatFollowers(creator.followers)}</span>
                  <span className="text-muted-foreground ml-1">followers</span>
                </div>
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-semibold text-yellow-600">{creator.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="font-semibold mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {creator.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recent Work */}
          <div>
            <h3 className="font-semibold mb-3">Recent Work</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {creator.recentWork.map((work, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={work}
                    alt={`Work ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Collaboration Rate</h3>
            <div className="text-2xl font-bold text-primary">{creator.priceRange}</div>
            <p className="text-sm text-muted-foreground">per collaboration</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {creator.instagramUrl && (
              <Button variant="outline" className="flex-1" onClick={handleViewInstagram}>
                <Instagram className="w-4 h-4 mr-2" />
                View Instagram
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
            <Button onClick={handleConnect} className="flex-1">
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Conversation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatorProfileModal;