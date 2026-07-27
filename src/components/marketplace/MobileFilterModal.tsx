
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface FilterOptions {
  priceRange: [number, number];
  propertyTypes: string[];
  amenities: string[];
  collaborationTypes: string[];
}

interface MobileFilterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const MobileFilterModal = ({ isOpen, onOpenChange, filters, onFiltersChange }: MobileFilterModalProps) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const propertyTypeOptions = [
    'Villa', 'Apartment', 'House', 'Loft', 'Cabin', 'Condo', 'Studio'
  ];

  const amenityOptions = [
    'WiFi', 'Pool', 'Parking', 'Kitchen', 'Washer', 'Hot Tub', 
    'Fireplace', 'Beach Access', 'Balcony', 'Pet Friendly'
  ];

  const collaborationOptions = [
    'Free Stay', '50% Discount', '30% Discount', 'Paid Collaboration'
  ];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleFilter = (item: string, currentList: string[], key: keyof FilterOptions) => {
    const newList = currentList.includes(item)
      ? currentList.filter(i => i !== item)
      : [...currentList, item];
    
    setLocalFilters(prev => ({
      ...prev,
      [key]: newList
    }));
  };

  const clearAll = () => {
    const clearedFilters = {
      priceRange: [0, 1000] as [number, number],
      propertyTypes: [],
      amenities: [],
      collaborationTypes: []
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const activeFiltersCount = localFilters.propertyTypes.length + 
                            localFilters.amenities.length + 
                            localFilters.collaborationTypes.length;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center justify-between">
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-brand-green text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Price Range */}
          <div>
            <h4 className="font-medium mb-4 text-lg">Price range</h4>
            <div className="px-2">
              <Slider
                value={localFilters.priceRange}
                onValueChange={(value) => setLocalFilters(prev => ({ 
                  ...prev, 
                  priceRange: value as [number, number] 
                }))}
                max={1000}
                min={0}
                step={10}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${localFilters.priceRange[0]}</span>
                <span>${localFilters.priceRange[1]}+</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Property Type */}
          <div>
            <h4 className="font-medium mb-4 text-lg">Property type</h4>
            <div className="grid grid-cols-2 gap-3">
              {propertyTypeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-3 p-2">
                  <Checkbox
                    id={type}
                    checked={localFilters.propertyTypes.includes(type)}
                    onCheckedChange={() => toggleFilter(type, localFilters.propertyTypes, 'propertyTypes')}
                  />
                  <label htmlFor={type} className="text-sm text-foreground/80 cursor-pointer flex-1">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Amenities */}
          <div>
            <h4 className="font-medium mb-4 text-lg">Amenities</h4>
            <div className="grid grid-cols-2 gap-3">
              {amenityOptions.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-3 p-2">
                  <Checkbox
                    id={amenity}
                    checked={localFilters.amenities.includes(amenity)}
                    onCheckedChange={() => toggleFilter(amenity, localFilters.amenities, 'amenities')}
                  />
                  <label htmlFor={amenity} className="text-sm text-foreground/80 cursor-pointer flex-1">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Collaboration Type */}
          <div>
            <h4 className="font-medium mb-4 text-lg">Collaboration type</h4>
            <div className="space-y-3">
              {collaborationOptions.map((type) => (
                <div key={type} className="flex items-center space-x-3 p-2">
                  <Checkbox
                    id={type}
                    checked={localFilters.collaborationTypes.includes(type)}
                    onCheckedChange={() => toggleFilter(type, localFilters.collaborationTypes, 'collaborationTypes')}
                  />
                  <label htmlFor={type} className="text-sm text-foreground/80 cursor-pointer flex-1">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="border-t pt-4 pb-safe">
          <div className="flex space-x-3">
            <Button variant="outline" onClick={clearAll} className="flex-1 h-12">
              Clear all
            </Button>
            <Button 
              className="flex-1 bg-brand-green hover:bg-brand-green/90 h-12"
              onClick={applyFilters}
            >
              Show results
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterModal;
