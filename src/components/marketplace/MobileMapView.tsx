
import React, { useState } from 'react';
import { PropertyMapLazy as PropertyMap } from './PropertyMapLazy';
import { Button } from '@/components/ui/button';
import { List, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import MobilePropertyCard from './MobilePropertyCard';

interface Property {
  id: string;
  title: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  rating: number;
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
  discount?: number;
}

interface MobileMapViewProps {
  properties: Property[];
  activeFilters: string[];
  searchQuery: string;
  onPropertySelect?: (property: Property) => void;
}

const MobileMapView = ({ properties, activeFilters, searchQuery, onPropertySelect }: MobileMapViewProps) => {
  const [isListOpen, setIsListOpen] = useState(false);

  // Filter properties based on active filters
  const filteredProperties = properties.filter(property => {
    if (activeFilters.length === 0) return true;
    
    return activeFilters.some(filter => {
      switch (filter) {
        case 'Superhost':
          return property.isSuperhost;
        case 'Free Stay':
          return property.pricePerNight === 0;
        case 'Pool':
          return property.amenities.includes('Pool');
        case 'WiFi':
          return property.amenities.includes('WiFi');
        case 'Kitchen':
          return property.amenities.includes('Kitchen');
        case 'Pet Friendly':
          return property.amenities.includes('Pet Friendly');
        default:
          return false;
      }
    });
  });

  return (
    <div className="relative w-full h-full">
      {/* Full-screen map */}
      <PropertyMap
        properties={properties}
        activeFilters={activeFilters}
        searchQuery={searchQuery}
        onPropertySelect={onPropertySelect}
        className="w-full h-full"
      />
      
      {/* Floating list button */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <Sheet open={isListOpen} onOpenChange={setIsListOpen}>
          <SheetTrigger asChild>
            <Button className="bg-card text-foreground hover:bg-muted shadow-lg px-6 py-3 rounded-full">
              <List className="w-4 h-4 mr-2" />
              List ({filteredProperties.length})
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left">
                {filteredProperties.length} collaboration opportunities
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4 pb-4">
              {filteredProperties.map(property => (
                <MobilePropertyCard 
                  key={property.id} 
                  property={property}
                  onClick={() => onPropertySelect?.(property)}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileMapView;
