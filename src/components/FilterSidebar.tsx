
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/utils/formatters";
import { X } from "lucide-react";

interface FilterOptions {
  priceRange: [number, number];
  propertyTypes: string[];
  amenities: string[];
  collaborationTypes: string[];
}

interface FilterSidebarProps {
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const FilterSidebar = ({ onClose, filters, onFiltersChange }: FilterSidebarProps) => {
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

  const toggleFilter = (item: string, currentList: string[], key: keyof FilterOptions) => {
    const newList = currentList.includes(item)
      ? currentList.filter(i => i !== item)
      : [...currentList, item];
    
    onFiltersChange({
      ...filters,
      [key]: newList
    });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: value as [number, number]
    });
  };

  const clearAll = () => {
    onFiltersChange({
      priceRange: [0, 1000],
      propertyTypes: [],
      amenities: [],
      collaborationTypes: []
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-32">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-4">Price range</h4>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            max={1000}
            min={0}
            step={10}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatCurrency(filters.priceRange[0])}</span>
            <span>{formatCurrency(filters.priceRange[1])}+</span>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="mb-6">
        <h4 className="font-medium mb-4">Property type</h4>
        <div className="space-y-3">
          {propertyTypeOptions.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={filters.propertyTypes.includes(type)}
                onCheckedChange={() => toggleFilter(type, filters.propertyTypes, 'propertyTypes')}
              />
              <label htmlFor={type} className="text-sm text-gray-700 cursor-pointer">
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      <div className="mb-6">
        <h4 className="font-medium mb-4">Amenities</h4>
        <div className="space-y-3">
          {amenityOptions.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={() => toggleFilter(amenity, filters.amenities, 'amenities')}
              />
              <label htmlFor={amenity} className="text-sm text-gray-700 cursor-pointer">
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      <div className="mb-6">
        <h4 className="font-medium mb-4">Collaboration type</h4>
        <div className="space-y-3">
          {collaborationOptions.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={filters.collaborationTypes.includes(type)}
                onCheckedChange={() => toggleFilter(type, filters.collaborationTypes, 'collaborationTypes')}
              />
              <label htmlFor={type} className="text-sm text-gray-700 cursor-pointer">
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={clearAll} className="flex-1">
          Clear all
        </Button>
        <Button className="flex-1 bg-brand-green hover:bg-brand-green/90" onClick={onClose}>
          Show results
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
