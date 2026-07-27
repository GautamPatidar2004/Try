
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, Users, Bed, Bath, Wifi } from "lucide-react";
import { useState } from "react";

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
    business?: string;
  };
  availableDates: string;
  description?: string;
   discount?: number | null;
   originalPrice?: number | null;
}

interface MobilePropertyCardProps {
  property: Property;
  onClick?: () => void;
  onApplyClick?: () => void;
}

const MobilePropertyCard = ({ property, onClick, onApplyClick }: MobilePropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApplyClick) {
      onApplyClick();
    }
  };

  return (
    <Card 
      className="overflow-hidden shadow-sm border-border hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        
        {/* Image Navigation */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-card w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-card w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10"
            >
              ›
            </button>
            
            {/* Image Dots */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {property.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentImageIndex ? 'bg-card' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Heart Icon */}
        <button
          onClick={handleLikeClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-card z-10"
        >
          <Heart 
            className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
          />
        </button>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {property.isSuperhost && (
            <Badge className="bg-card text-foreground text-xs font-medium">
              Superhost
            </Badge>
          )}
          <Badge 
            className={`text-xs font-medium ${
              property.collaborationType === 'Free Stay' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {property.collaborationType}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Rating and Location */}
        <div className="flex items-center justify-between">
          {property.reviews > 0 ? (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{property.rating}</span>
              <span className="text-sm text-muted-foreground">({property.reviews})</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">New listing</span>
          )}
          <span className="text-sm text-muted-foreground">{property.location}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
          {property.title}
        </h3>

        {/* Property Details */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{property.guests}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
          {property.amenities.includes('WiFi') && (
            <div className="flex items-center space-x-1">
              <Wifi className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Host and Price */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">Hosted by {property.host.name}</span>
          <div className="text-right">
            {property.pricePerNight === 0 ? (
              <span className="font-semibold text-green-600">Free Stay</span>
            ) : (
               <div className="flex items-center gap-2">
                 {property.originalPrice && property.discount && property.originalPrice > property.pricePerNight && (
                   <span className="text-muted-foreground line-through text-sm">
                     ${property.originalPrice}
                   </span>
                 )}
                 <span className="font-semibold text-foreground">${property.pricePerNight}</span>
                 <span className="text-sm text-muted-foreground">/ night</span>
               </div>
            )}
          </div>
        </div>
         
         {property.discount && property.discount > 0 && (
           <Badge className="bg-green-500 text-white text-xs w-fit">
             {property.discount}% off
           </Badge>
         )}

        {/* CTA Button */}
        <Button 
          className="w-full bg-brand-green hover:bg-brand-green/90 h-11 mt-3"
          onClick={handleApplyClick}
        >
          Apply to Collaborate
        </Button>
      </div>
    </Card>
  );
};

export default MobilePropertyCard;
