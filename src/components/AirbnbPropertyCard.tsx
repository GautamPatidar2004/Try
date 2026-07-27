import { useState } from "react";
import { Star, Heart, Bed, Bath, Users, Wifi, Waves, UtensilsCrossed, Car } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MatchBadge from "@/components/ai-matching/MatchBadge";
import { cn } from "@/lib/utils";

interface Property {
  id: string;
  title: string;
  location: string;
  images: string[];
  rating: number | null;
  reviews: number;
  type: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  amenities: string[];
  contentRequirements: string[];
  collaborationType: string;
  isSuperhost: boolean;
  host: {
    name: string;
    avatar: string;
    responseRate: number;
  };
  availableDates: string;
  aiMatch?: {
    match_score: number;
    match_reasons: string[];
    ai_recommendation: string;
  };
   originalPrice?: number | null;
   discount?: number | null;
}

interface AirbnbPropertyCardProps {
  property: Property;
  onClick?: () => void;
}

// Collaboration type styling
const collaborationStyles: Record<string, { gradient: string; icon: string }> = {
  'Free Stay': { gradient: 'from-emerald-500 to-emerald-600', icon: '🏡' },
  'free_stay': { gradient: 'from-emerald-500 to-emerald-600', icon: '🏡' },
  'Discounted Stay': { gradient: 'from-amber-500 to-orange-500', icon: '💫' },
  'discount': { gradient: 'from-amber-500 to-orange-500', icon: '💫' },
  'Paid Collaboration': { gradient: 'from-blue-500 to-purple-500', icon: '💰' },
  'paid': { gradient: 'from-blue-500 to-purple-500', icon: '💰' },
};

// Amenity icons
const amenityIconMap: Record<string, React.ElementType> = {
  'WiFi': Wifi,
  'Pool': Waves,
  'Kitchen': UtensilsCrossed,
  'Parking': Car,
};

const AirbnbPropertyCard = ({ property, onClick }: AirbnbPropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  // Get collaboration style
  const collabStyle = collaborationStyles[property.collaborationType] || collaborationStyles['Free Stay'];

  // Get top amenities to show
  const topAmenities = property.amenities.slice(0, 3);
  const remainingCount = Math.max(0, property.amenities.length - 3);

  return (
    <Card 
      className="group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-card"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.images[currentImageIndex]} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Heart button */}
        <button 
          onClick={handleLikeClick}
          className="absolute top-3 right-3 p-2 z-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors"
        >
          <Heart 
            className={cn(
              "w-5 h-5 transition-colors",
              isLiked ? 'fill-red-500 text-red-500' : 'text-white'
            )}
          />
        </button>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {property.isSuperhost && (
            <Badge className="bg-white/95 text-foreground text-xs font-semibold shadow-sm">
              ⭐ Superhost
            </Badge>
          )}
          {property.aiMatch && property.aiMatch.match_score >= 70 && (
            <MatchBadge 
              score={property.aiMatch.match_score} 
              className="text-xs shadow-sm"
            />
          )}
        </div>
        
        {/* Image navigation */}
        {property.images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm hover:bg-white"
            >
              ‹
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm hover:bg-white"
            >
              ›
            </button>
            
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
              {property.images.map((_, index) => (
                <div 
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Collaboration Type Badge */}
        <Badge 
          className={cn(
            "bg-gradient-to-r text-white border-0 text-xs font-semibold shadow-sm",
            collabStyle.gradient
          )}
        >
          {collabStyle.icon} {property.collaborationType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>

        {/* AI Recommendation */}
        {property.aiMatch && property.aiMatch.match_score >= 70 && (
          <p className="text-xs text-emerald-600 font-medium line-clamp-1">
            {property.aiMatch.ai_recommendation}
          </p>
        )}
        
        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-1 flex-1">
            {property.title}
          </h3>
          {property.reviews > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold">{property.rating}</span>
              <span className="text-xs text-muted-foreground">({property.reviews})</span>
            </div>
          )}
        </div>
        
        {/* Location */}
        <p className="text-sm text-muted-foreground line-clamp-1">
          {property.location}
        </p>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{property.guests}</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-2 flex-wrap">
          {topAmenities.map((amenity) => {
            const Icon = amenityIconMap[amenity];
            return (
              <Badge 
                key={amenity} 
                variant="secondary" 
                className="text-xs font-normal bg-muted/50 hover:bg-muted"
              >
                {Icon && <Icon className="w-3 h-3 mr-1" />}
                {amenity}
              </Badge>
            );
          })}
          {remainingCount > 0 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{remainingCount} more
            </Badge>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border/50 pt-3">
          {/* Host Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img 
                src={property.host.avatar} 
                alt={property.host.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs text-muted-foreground">
                {property.host.name} · {property.host.responseRate}% response
              </span>
            </div>
             {property.pricePerNight > 0 ? (
               <div className="text-right flex items-center gap-2">
                 {property.originalPrice && property.discount && property.originalPrice > property.pricePerNight && (
                   <span className="text-muted-foreground line-through text-sm">
                     ${property.originalPrice}
                   </span>
                 )}
                 <span className="font-bold text-foreground">${property.pricePerNight}</span>
                 <span className="text-xs text-muted-foreground">/ night</span>
                 {property.discount && property.discount > 0 && (
                   <Badge className="bg-emerald-500 text-white text-xs">
                     {property.discount}% off
                   </Badge>
                 )}
               </div>
             ) : property.collaborationType.toLowerCase().includes('free') ? (
               <span className="font-bold text-emerald-600">Free Stay</span>
             ) : null}
          </div>

          {/* Availability */}

          {/* View Button */}
          <Button 
            variant="outline" 
            className="w-full rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            View Property
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AirbnbPropertyCard;
