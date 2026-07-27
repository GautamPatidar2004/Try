import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Users } from "lucide-react";

interface Property {
  id: string;
  title?: string;
  location?: string;
  property_type?: string;
  bedrooms?: number;
  max_guests?: number;
  property_images?: { image_url: string }[];
}

interface DemoPropertyCardProps {
  property: Property;
  onInteraction: () => void;
}

export const DemoPropertyCard = ({ property, onInteraction }: DemoPropertyCardProps) => {
  const imageUrl = property.property_images?.[0]?.image_url;

  return (
    <Card 
      className="min-w-[200px] max-w-[200px] overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors border-border/50"
      onClick={onInteraction}
    >
      <div 
        className="h-24 bg-muted bg-cover bg-center"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      />
      <div className="p-3 space-y-2">
        <p className="font-medium text-sm text-foreground truncate">
          {property.title || 'Property'}
        </p>
        
        {property.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{property.location}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.max_guests && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{property.max_guests}</span>
            </div>
          )}
        </div>

        {property.property_type && (
          <Badge variant="outline" className="text-[10px]">
            {property.property_type}
          </Badge>
        )}
      </div>
    </Card>
  );
};
