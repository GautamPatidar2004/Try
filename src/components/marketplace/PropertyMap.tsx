
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Bed, Bath, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface PropertyMapProps {
  properties: Property[];
  activeFilters: string[];
  searchQuery: string;
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

const PropertyMap = ({ 
  properties, 
  activeFilters, 
  searchQuery, 
  onPropertySelect,
  className = ""
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

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

  // Fetch Mapbox token on component mount
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setApiKeyError(true);
          setMapLoading(false);
          return;
        }

        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setApiKeyError(true);
          setMapLoading(false);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setApiKeyError(true);
        setMapLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  // Initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98.5795, 39.8283], // Center of US
        zoom: 3
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoading(false);
        // Add markers for properties
        addMarkersToMap();

        // Fit map to show all properties
        if (filteredProperties.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          filteredProperties.forEach(property => {
            bounds.extend([property.coordinates.lng, property.coordinates.lat]);
          });
          map.current!.fitBounds(bounds, { padding: 50 });
        }
      });

    } catch (error) {
      console.error('Mapbox initialization error:', error);
      setApiKeyError(true);
      setMapLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (map.current) {
      addMarkersToMap();
    }
  }, [filteredProperties, activeFilters]);

  const addMarkersToMap = () => {
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    if (!map.current) return;

    filteredProperties.forEach(property => {
      // Create marker element using DOM methods instead of innerHTML (prevents XSS)
      const markerElement = document.createElement('div');
      markerElement.className = 'property-marker';
      
      const container = document.createElement('div');
      container.className = 'bg-card rounded-lg shadow-lg p-2 border-2 border-brand-green cursor-pointer hover:shadow-xl transition-shadow';
      
      const priceDiv = document.createElement('div');
      priceDiv.className = 'text-sm font-semibold text-foreground';
      priceDiv.textContent = property.pricePerNight === 0 ? 'Free' : `$${property.pricePerNight}`;
      
      container.appendChild(priceDiv);
      markerElement.appendChild(container);

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([property.coordinates.lng, property.coordinates.lat])
        .addTo(map.current!);

      // Add click event
      markerElement.addEventListener('click', () => {
        setSelectedProperty(property);
        if (onPropertySelect) {
          onPropertySelect(property);
        }
      });

      markers.current.push(marker);
    });
  };

  const handleApplyClick = () => {
    if (selectedProperty && onPropertySelect) {
      onPropertySelect(selectedProperty);
    }
  };

  if (apiKeyError) {
    return (
      <div className={`bg-muted rounded-lg flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Map Setup Required</h3>
          <p className="text-muted-foreground mb-4">
            Unable to load map. Please check your Mapbox API configuration.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (mapLoading) {
    return (
      <div className={`bg-muted rounded-lg flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Loading Map...</h3>
          <div className="animate-pulse w-8 h-8 bg-gray-300 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Property Preview Modal */}
      {selectedProperty && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="bg-card shadow-lg">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={() => setSelectedProperty(null)}
              >
                <X className="w-4 h-4" />
              </Button>
              
              <img
                src={selectedProperty.images[0]}
                alt={selectedProperty.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{selectedProperty.rating}</span>
                    <span className="text-sm text-muted-foreground">({selectedProperty.reviews})</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{selectedProperty.location}</span>
                </div>
                
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {selectedProperty.title}
                </h3>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{selectedProperty.guests}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bed className="w-4 h-4" />
                    <span>{selectedProperty.bedrooms}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bath className="w-4 h-4" />
                    <span>{selectedProperty.bathrooms}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hosted by {selectedProperty.host.name}</span>
                  <div className="text-right">
                    {selectedProperty.pricePerNight === 0 ? (
                      <span className="font-semibold text-green-600">Free Stay</span>
                    ) : (
                      <>
                        <span className="font-semibold text-foreground">${selectedProperty.pricePerNight}</span>
                        <span className="text-sm text-muted-foreground"> /night</span>
                      </>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-3 bg-brand-green hover:bg-brand-green/90"
                  onClick={handleApplyClick}
                >
                  Apply to Collaborate
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
