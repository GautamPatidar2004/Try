import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Loader2 } from "lucide-react";

interface Property {
  id: string;
  title: string;
  property_type: string;
  location: string;
}

interface PropertySelectorProps {
  properties: Property[];
  selectedPropertyId: string | null;
  onChange: (propertyId: string) => void;
  isLoading?: boolean;
}

const PropertySelector = ({ properties, selectedPropertyId, onChange, isLoading }: PropertySelectorProps) => {
  if (properties.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">No properties available</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium whitespace-nowrap">Show matches for:</label>
      <Select value={selectedPropertyId || ""} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a property" />
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <div>
                  <div className="font-medium">{property.title}</div>
                  <div className="text-xs text-muted-foreground">{property.location}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
};

export default PropertySelector;
