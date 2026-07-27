import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Home, Building2, Hotel, TreePine, Castle, Warehouse,
  Wifi, Car, UtensilsCrossed, Waves, Dumbbell, Snowflake,
  Flame, Bath, Trees, Umbrella, PawPrint, Accessibility,
  Shirt, Tv, Wind
} from "lucide-react";
import { FilterOptions } from "@/hooks/useMarketplace";
import { usePropertyFilterOptions } from "@/hooks/usePropertyFilterOptions";
import { cn } from "@/lib/utils";

interface StaysFilterContentProps {
  filters: FilterOptions;
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
}

// Property type icons mapping
const propertyTypeIcons: Record<string, React.ElementType> = {
  house: Home,
  apartment: Building2,
  villa: Castle,
  cabin: TreePine,
  condo: Building2,
  cottage: Home,
  loft: Warehouse,
  studio: Building2,
  townhouse: Home,
  hotel: Hotel,
  other: Home,
};

// Amenity icons mapping
const amenityIcons: Record<string, React.ElementType> = {
  'WiFi': Wifi,
  'Kitchen': UtensilsCrossed,
  'Parking': Car,
  'Pool': Waves,
  'Gym': Dumbbell,
  'Air Conditioning': Snowflake,
  'Heating': Flame,
  'Hot Tub': Bath,
  'Balcony': Wind,
  'Garden': Trees,
  'Beach Access': Umbrella,
  'Pet Friendly': PawPrint,
  'Wheelchair Accessible': Accessibility,
  'Laundry': Shirt,
  'TV': Tv,
  'Fireplace': Flame,
};

// Group amenities by category
const amenityCategories: Record<string, string[]> = {
  'Essentials': ['WiFi', 'Kitchen', 'Parking', 'Laundry', 'TV'],
  'Climate': ['Air Conditioning', 'Heating', 'Fireplace'],
  'Outdoors': ['Pool', 'Hot Tub', 'Garden', 'Balcony', 'Beach Access'],
  'Accessibility': ['Wheelchair Accessible', 'Pet Friendly', 'Gym'],
};

// Collaboration type config with gradients
const collaborationTypeConfig = [
  { value: 'free_stay', label: 'Free Stay', icon: '🏡', gradient: 'from-emerald-500 to-emerald-600' },
  { value: 'discount', label: 'Discounted', icon: '💫', gradient: 'from-amber-500 to-orange-500' },
  { value: 'paid', label: 'Paid Collab', icon: '💰', gradient: 'from-blue-500 to-purple-500' },
];

export const StaysFilterContent = ({
  filters,
  onFiltersChange,
}: StaysFilterContentProps) => {
  const { propertyTypes, amenities } = usePropertyFilterOptions();

  const handlePropertyTypeToggle = (type: string) => {
    const updated = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    onFiltersChange({ propertyTypes: updated });
  };

  const handleAmenityToggle = (amenity: string) => {
    const updated = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    onFiltersChange({ amenities: updated });
  };

  const handleCollaborationTypeToggle = (type: string) => {
    const updated = filters.collaborationTypes.includes(type)
      ? filters.collaborationTypes.filter(t => t !== type)
      : [...filters.collaborationTypes, type];
    onFiltersChange({ collaborationTypes: updated });
  };

  // Format property type for display
  const formatPropertyType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get all available amenities grouped
  const getGroupedAmenities = () => {
    const grouped: Record<string, string[]> = {};
    
    Object.entries(amenityCategories).forEach(([category, categoryAmenities]) => {
      const available = categoryAmenities.filter(a => amenities.includes(a));
      if (available.length > 0) {
        grouped[category] = available;
      }
    });
    
    // Add any amenities not in categories to "Other"
    const categorizedAmenities = Object.values(amenityCategories).flat();
    const otherAmenities = amenities.filter(a => !categorizedAmenities.includes(a));
    if (otherAmenities.length > 0) {
      grouped['Other'] = otherAmenities;
    }
    
    return grouped;
  };

  const groupedAmenities = getGroupedAmenities();

  return (
    <div className="space-y-6">
      {/* Collaboration Types - Gradient buttons */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Collaboration Type</Label>
        <div className="space-y-2">
          {collaborationTypeConfig.map((collab) => {
            const isSelected = filters.collaborationTypes.includes(collab.value);
            return (
              <button
                key={collab.value}
                onClick={() => handleCollaborationTypeToggle(collab.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                  isSelected
                    ? `bg-gradient-to-r ${collab.gradient} text-white shadow-lg`
                    : "bg-muted/50 hover:bg-muted border border-border/50"
                )}
              >
                <span className="text-lg">{collab.icon}</span>
                <span className="font-medium">{collab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Price Range</Label>
          <span className="text-xs font-medium px-2 py-1 bg-primary/10 rounded-full text-primary">
            ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </span>
        </div>
        <Slider
          min={0}
          max={1000}
          step={50}
          value={filters.priceRange}
          onValueChange={(value) => onFiltersChange({ priceRange: value as [number, number] })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$0</span>
          <span>$1000+</span>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Property Types */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Property Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {propertyTypes.map((type) => {
            const Icon = propertyTypeIcons[type.toLowerCase()] || Home;
            const isSelected = filters.propertyTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => handlePropertyTypeToggle(type)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/50 hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="text-sm font-medium truncate">
                  {formatPropertyType(type)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Amenities - Grouped by category */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">Amenities</Label>
        {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
          <div key={category} className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {category}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {categoryAmenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || Wifi;
                const isSelected = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <Icon className={cn(
                      "h-3.5 w-3.5 flex-shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="text-xs font-medium truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Capacity Filters */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">Capacity</Label>
        
        {/* Guests */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Guests</span>
            <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded-full">
              {filters.minGuests}+
            </span>
          </div>
          <Slider
            min={1}
            max={16}
            step={1}
            value={[filters.minGuests]}
            onValueChange={(value) => onFiltersChange({ minGuests: value[0] })}
          />
        </div>

        {/* Bedrooms */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bedrooms</span>
            <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded-full">
              {filters.minBedrooms}+
            </span>
          </div>
          <Slider
            min={0}
            max={8}
            step={1}
            value={[filters.minBedrooms]}
            onValueChange={(value) => onFiltersChange({ minBedrooms: value[0] })}
          />
        </div>

        {/* Bathrooms */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bathrooms</span>
            <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded-full">
              {filters.minBathrooms}+
            </span>
          </div>
          <Slider
            min={0}
            max={6}
            step={0.5}
            value={[filters.minBathrooms]}
            onValueChange={(value) => onFiltersChange({ minBathrooms: value[0] })}
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Rating */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Minimum Rating</Label>
          <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
            ★ {filters.minRating}+
          </span>
        </div>
        <Slider
          min={0}
          max={5}
          step={0.5}
          value={[filters.minRating]}
          onValueChange={(value) => onFiltersChange({ minRating: value[0] })}
        />
      </div>

      <Separator className="my-4" />

      {/* Toggles */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">More Options</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <Label htmlFor="superhost" className="text-sm font-medium cursor-pointer">
                Superhost Only
              </Label>
            </div>
            <Switch
              id="superhost"
              checked={filters.superhostOnly}
              onCheckedChange={(checked) => onFiltersChange({ superhostOnly: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <Label htmlFor="instant-book" className="text-sm font-medium cursor-pointer">
                Instant Book
              </Label>
            </div>
            <Switch
              id="instant-book"
              checked={filters.instantBookOnly}
              onCheckedChange={(checked) => onFiltersChange({ instantBookOnly: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
