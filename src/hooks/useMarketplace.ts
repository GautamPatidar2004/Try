import { useState, useMemo } from 'react';

export interface Property {
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
  instantBook?: boolean;
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

export interface FilterOptions {
  priceRange: [number, number];
  propertyTypes: string[];
  amenities: string[];
  collaborationTypes: string[];
  minGuests: number;
  minBedrooms: number;
  minBathrooms: number;
  minRating: number;
  superhostOnly: boolean;
  instantBookOnly: boolean;
}

export interface SearchParams {
  query: string;
  location?: string;
  dates?: string;
  guests?: number;
}

export const useMarketplace = (properties: Property[]) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({ query: '' });
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000],
    propertyTypes: [],
    amenities: [],
    collaborationTypes: [],
    minGuests: 1,
    minBedrooms: 0,
    minBathrooms: 0,
    minRating: 0,
    superhostOnly: false,
    instantBookOnly: false,
  });

  // Enhanced search function that searches across multiple fields
  const matchesSearch = (property: Property, searchParams: SearchParams) => {
    const { query, location, guests } = searchParams;
    
    // If no search criteria, return true
    if (!query && !location && !guests) return true;
    
    let matches = true;
    
    // Text search across multiple fields
    if (query) {
      const searchLower = query.toLowerCase();
      const textMatch = (
        property.title.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower) ||
        property.description?.toLowerCase().includes(searchLower) ||
        property.host.name.toLowerCase().includes(searchLower) ||
        property.host.business?.toLowerCase().includes(searchLower) ||
        property.amenities.some(amenity => amenity.toLowerCase().includes(searchLower)) ||
        property.type.toLowerCase().includes(searchLower)
      );
      matches = matches && textMatch;
    }
    
    // Location-specific search
    if (location && location !== query) {
      const locationMatch = property.location.toLowerCase().includes(location.toLowerCase());
      matches = matches && locationMatch;
    }
    
    // Guest capacity filter
    if (guests && guests > 1) {
      matches = matches && property.guests >= guests;
    }
    
    return matches;
  };

  // Filter properties based on all active filters
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Search parameters filter
      if (!matchesSearch(property, searchParams)) {
        return false;
      }

      // Quick filters
      if (activeQuickFilters.length > 0) {
        const matchesQuickFilter = activeQuickFilters.every(filter => {
          switch (filter) {
            case 'Superhost':
              return property.isSuperhost;
            case 'Free Stay':
              return property.pricePerNight === 0 || property.collaborationType === 'Free Stay';
            case 'Pool':
              return property.amenities.some(a => a.toLowerCase() === 'pool');
            case 'WiFi':
              return property.amenities.some(a => a.toLowerCase() === 'wifi');
            case 'Kitchen':
              return property.amenities.some(a => a.toLowerCase() === 'kitchen');
            case 'Pet Friendly':
              return property.amenities.some(a => a.toLowerCase() === 'pet friendly');
            default:
              return true;
          }
        });
        if (!matchesQuickFilter) return false;
      }

      // Detailed filters
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
        if (property.pricePerNight < filters.priceRange[0] || property.pricePerNight > filters.priceRange[1]) {
          return false;
        }
      }

      if (filters.propertyTypes.length > 0) {
        const matchesType = filters.propertyTypes.some(filterType =>
          property.type.toLowerCase() === filterType.toLowerCase()
        );
        if (!matchesType) return false;
      }

      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(filterAmenity =>
          property.amenities.some(propAmenity => 
            propAmenity.toLowerCase() === filterAmenity.toLowerCase()
          )
        );
        if (!hasAllAmenities) return false;
      }

      if (filters.collaborationTypes.length > 0) {
        const matchesCollaboration = filters.collaborationTypes.some(filterType => {
          const filterLower = filterType.toLowerCase();
          const propTypeLower = property.collaborationType.toLowerCase();
          
          // Check for exact match (case-insensitive)
          if (propTypeLower === filterLower) return true;
          
          // Handle "Free Stay" variations
          if (filterLower === 'free stay' && (property.pricePerNight === 0 || propTypeLower === 'free stay')) {
            return true;
          }
          
          // Handle "Discounted Stay" matching any discount percentage
          if (filterLower === 'discounted stay' && propTypeLower.includes('discount')) {
            return true;
          }
          
          // Handle "Paid Partnership" variations
          if (filterLower === 'paid partnership' && 
              (propTypeLower === 'paid collaboration' || propTypeLower === 'paid collab' || propTypeLower === 'paid partnership')) {
            return true;
          }
          
          // Handle "Content Trade" variations
          if (filterLower === 'content trade' && 
              (propTypeLower === 'content exchange' || propTypeLower === 'content trade')) {
            return true;
          }
          
          return false;
        });
        if (!matchesCollaboration) return false;
      }

      // Additional filters
      if (filters.minGuests > 1 && property.guests < filters.minGuests) {
        return false;
      }

      if (filters.minBedrooms > 0 && property.bedrooms < filters.minBedrooms) {
        return false;
      }

      if (filters.minBathrooms > 0 && property.bathrooms < filters.minBathrooms) {
        return false;
      }

      if (filters.minRating > 0 && property.rating < filters.minRating) {
        return false;
      }

      if (filters.superhostOnly && !property.isSuperhost) {
        return false;
      }

      if (filters.instantBookOnly && property.instantBook === false) {
        return false;
      }

      return true;
    });
  }, [properties, searchParams, activeQuickFilters, filters]);

  // Sort filtered properties
  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
      case 'price-high':
        return sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'reviews':
        return sorted.sort((a, b) => b.reviews - a.reviews);
      default:
        return sorted;
    }
  }, [filteredProperties, sortBy]);

  const handleQuickFilterToggle = (filter: string) => {
    setActiveQuickFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleSearch = (query: string, location?: string, dates?: string, guests?: number) => {
    setSearchParams({ query, location, dates, guests });
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.collaborationTypes.length > 0) count++;
    if (filters.minGuests > 1) count++;
    if (filters.minBedrooms > 0) count++;
    if (filters.minBathrooms > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.superhostOnly) count++;
    if (filters.instantBookOnly) count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    setActiveQuickFilters([]);
    setFilters({
      priceRange: [0, 1000],
      propertyTypes: [],
      amenities: [],
      collaborationTypes: [],
      minGuests: 1,
      minBedrooms: 0,
      minBathrooms: 0,
      minRating: 0,
      superhostOnly: false,
      instantBookOnly: false,
    });
    setSearchParams({ query: '' });
  };

  return {
    // State
    searchQuery: searchParams.query,
    searchParams,
    activeQuickFilters,
    selectedProperty,
    sortBy,
    filters,
    
    // Derived state
    filteredProperties: sortedProperties,
    activeFilterCount,
    
    // Actions
    setSearchQuery: (query: string) => setSearchParams(prev => ({ ...prev, query })),
    setSearchParams,
    handleSearch,
    setActiveQuickFilters,
    handleQuickFilterToggle,
    setSelectedProperty,
    setSortBy,
    setFilters,
    clearAllFilters
  };
};
