import { DemoCreatorCard } from "./DemoCreatorCard";
import { DemoPropertyCard } from "./DemoPropertyCard";
import { DemoBrandCard } from "./DemoBrandCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Users, Building, Building2 } from "lucide-react";

interface DemoResultsSectionProps {
  creators?: any[];
  properties?: any[];
  brands?: any[];
  onInteraction: () => void;
}

export const DemoResultsSection = ({ 
  creators, 
  properties, 
  brands, 
  onInteraction 
}: DemoResultsSectionProps) => {
  const hasCreators = creators && creators.length > 0;
  const hasProperties = properties && properties.length > 0;
  const hasBrands = brands && brands.length > 0;

  if (!hasCreators && !hasProperties && !hasBrands) {
    return null;
  }

  return (
    <div className="space-y-4 mt-3">
      {hasCreators && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>Creators</span>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              {creators.map((creator) => (
                <DemoCreatorCard 
                  key={creator.id} 
                  creator={creator} 
                  onInteraction={onInteraction}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {hasProperties && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4 text-primary" />
            <span>Properties</span>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              {properties.map((property) => (
                <DemoPropertyCard 
                  key={property.id} 
                  property={property} 
                  onInteraction={onInteraction}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {hasBrands && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Brands</span>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              {brands.map((brand) => (
                <DemoBrandCard 
                  key={brand.id} 
                  brand={brand} 
                  onInteraction={onInteraction}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
