import { MapPin, Star, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/hooks/useRestaurants";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onViewDetails: (restaurant: Restaurant) => void;
}

const RestaurantCard = ({ restaurant, onViewDetails }: RestaurantCardProps) => {
  const primaryImage = restaurant.images?.find(img => img.is_primary) || restaurant.images?.[0];
  const priceRangeDisplay = {
    'budget': '$',
    'mid_range': '$$',
    'upscale': '$$$',
    'luxury': '$$$$'
  }[restaurant.price_range] || '$$';

  const collaborationBadge = () => {
    const types = restaurant.collaboration_types;
    if (types.includes('free_meal') && types.includes('paid_partnership')) {
      return 'Free & Paid';
    }
    if (types.includes('free_meal')) return 'Free Meal';
    if (types.includes('paid_partnership')) return 'Paid';
    return 'Both';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => onViewDetails(restaurant)}>
      <div className="relative aspect-video overflow-hidden bg-muted">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {collaborationBadge()}
          </Badge>
          {restaurant.featured && (
            <Badge className="bg-primary/90 backdrop-blur">Featured</Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{restaurant.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{restaurant.city}, {restaurant.country}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {restaurant.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="text-sm font-medium">{restaurant.average_rating.toFixed(1)}</span>
              </div>
            )}
            <span className="text-sm font-medium">{priceRangeDisplay}</span>
          </div>
          <div className="flex gap-1">
            {restaurant.cuisine_types.slice(0, 2).map((cuisine, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {cuisine}
              </Badge>
            ))}
          </div>
        </div>

        {restaurant.dietary_options.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {restaurant.dietary_options.slice(0, 3).map((option, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {option}
              </Badge>
            ))}
          </div>
        )}

        <Button className="w-full" variant="outline">
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default RestaurantCard;
