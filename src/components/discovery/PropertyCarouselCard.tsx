import { MapPin, Users, Bed, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PropertyCarouselCardProps {
  property: any;
  onClick: () => void;
}

export const PropertyCarouselCard = ({ property, onClick }: PropertyCarouselCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="flex-shrink-0 w-[280px] bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        {property.image_url ? (
          <img 
            src={property.image_url} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Home className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={property.collaboration_type === 'free_stay' ? 'default' : 'secondary'} className="shadow-lg">
            {property.collaboration_type === 'free_stay' ? 'Free Stay' : `${property.discount_percentage}% Off`}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-2">{property.title}</h3>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{property.location}</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" />
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{property.max_guests} guests</span>
          </div>
        </div>
        
        {property.amenities && property.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
