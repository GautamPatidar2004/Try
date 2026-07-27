
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Camera, Wifi, Car, Users } from "lucide-react";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    location: string;
    images: string[];
    rating: number;
    reviews: number;
    type: string;
    guests: number;
    amenities: string[];
    contentRequirements: string[];
    collaborationType: string;
    host: {
      name: string;
      avatar: string;
      responseRate: number;
    };
  };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const amenityIcons = {
    'WiFi': Wifi,
    'Parking': Car,
    'Pool': Users,
  };

  return (
    <Card className="group hover-lift hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="w-full h-48 object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 animate-fade-in">
          <Badge className="bg-brand-green text-white shadow-lg backdrop-blur-sm">
            {property.collaborationType}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Badge variant="secondary" className="glass-effect shadow-lg">
            <Camera className="w-3 h-3 mr-1" />
            Content Opportunity
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-brand-green transition-all duration-300">
            {property.title}
          </h3>
          <div className="flex items-center bg-gradient-to-r from-yellow-50 to-yellow-100/50 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1 animate-bounce-subtle" />
            <span className="text-sm font-medium">{property.rating}</span>
            <span className="text-sm text-gray-500 ml-1">({property.reviews})</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
          <span className="text-sm ml-4">{property.type} • {property.guests} guests</span>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">Content Requirements:</p>
          <div className="flex flex-wrap gap-1">
            {property.contentRequirements.map((req, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {req}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src={property.host.avatar} 
              alt={property.host.name}
              className="w-6 h-6 rounded-full ring-2 ring-brand-green/20 transition-all group-hover:ring-brand-green/50"
            />
            <span className="text-sm text-gray-600">
              Hosted by {property.host.name}
            </span>
          </div>
          <Button size="sm" variant="premium" className="shadow-lg">
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
