import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, SlidersHorizontal, Home, Wifi, Waves } from "lucide-react";
import { FilterOptions } from "@/hooks/useMarketplace";
import { cn } from "@/lib/utils";

interface StaysSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  resultCount: number;
  activeSearchQuery?: string;
  onClearSearch?: () => void;
  onMobileFilterToggle?: () => void;
  showAIMatch?: boolean;
  filters?: FilterOptions;
  onRemoveFilter?: (type: keyof FilterOptions, value?: string) => void;
}

// Icons for filter chips
const filterIcons: Record<string, React.ElementType> = {
  propertyTypes: Home,
  amenities: Wifi,
};

// Collaboration type display names
const collaborationLabels: Record<string, string> = {
  'free_stay': '🏡 Free Stay',
  'discount': '💫 Discounted',
  'paid': '💰 Paid Collab',
};

export const StaysSearchHeader = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
  activeSearchQuery,
  onClearSearch,
  onMobileFilterToggle,
  showAIMatch = false,
  filters,
  onRemoveFilter,
}: StaysSearchHeaderProps) => {
  // Generate active filter chips
  const getActiveFilterChips = () => {
    if (!filters || !onRemoveFilter) return [];
    
    const chips: { type: keyof FilterOptions; value: string; label: string; icon?: React.ElementType }[] = [];
    
    // Property types
    filters.propertyTypes.forEach(type => {
      chips.push({
        type: 'propertyTypes',
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
        icon: Home,
      });
    });
    
    // Amenities
    filters.amenities.forEach(amenity => {
      chips.push({
        type: 'amenities',
        value: amenity,
        label: amenity,
        icon: amenity === 'Pool' ? Waves : Wifi,
      });
    });
    
    // Collaboration types
    filters.collaborationTypes.forEach(type => {
      chips.push({
        type: 'collaborationTypes',
        value: type,
        label: collaborationLabels[type] || type,
      });
    });
    
    // Price range (only if modified)
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      chips.push({
        type: 'priceRange',
        value: 'price',
        label: `$${filters.priceRange[0]} - $${filters.priceRange[1]}`,
      });
    }
    
    // Toggles
    if (filters.superhostOnly) {
      chips.push({
        type: 'superhostOnly',
        value: 'superhost',
        label: '⭐ Superhost',
      });
    }
    
    if (filters.instantBookOnly) {
      chips.push({
        type: 'instantBookOnly',
        value: 'instant',
        label: '⚡ Instant Book',
      });
    }
    
    return chips;
  };

  const filterChips = getActiveFilterChips();

  return (
    <div className="bg-gradient-to-r from-background via-background to-primary/5 border-b shadow-sm">
      <div className="p-6 space-y-4">
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location, property name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 rounded-xl border-border/40 focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-border/40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              {showAIMatch && <SelectItem value="ai-match">AI Match Score</SelectItem>}
            </SelectContent>
          </Select>

          {/* Mobile Filter Button */}
          <button
            onClick={onMobileFilterToggle}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-border/40 hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Active Filters & Results Row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search query chip */}
            {activeSearchQuery && (
              <Badge 
                variant="secondary" 
                className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors"
              >
                <span className="text-xs font-medium">"{activeSearchQuery}"</span>
                <button
                  onClick={onClearSearch}
                  className="ml-2 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {/* Filter chips */}
            {filterChips.map((chip, index) => {
              const Icon = chip.icon;
              return (
                <Badge 
                  key={`${chip.type}-${chip.value}-${index}`}
                  variant="secondary" 
                  className={cn(
                    "px-3 py-1.5 rounded-full cursor-pointer transition-colors",
                    chip.type === 'collaborationTypes' 
                      ? "bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {Icon && <Icon className="h-3 w-3 mr-1" />}
                  <span className="text-xs font-medium">{chip.label}</span>
                  <button
                    onClick={() => onRemoveFilter?.(chip.type, chip.value)}
                    className="ml-2 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            
            {/* Results count */}
            <Badge variant="outline" className="rounded-full bg-background">
              {resultCount} {resultCount === 1 ? 'property' : 'properties'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaysSearchHeader;
