
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Grid3X3, Map } from "lucide-react";

interface MobileQuickFiltersProps {
  quickFilters: string[];
  activeFilters: string[];
  onFilterToggle: (filter: string) => void;
  showFilters: boolean;
  onFilterModalToggle: () => void;
  viewMode: 'grid' | 'map';
  onViewModeChange: (mode: 'grid' | 'map') => void;
}

const MobileQuickFilters = ({ 
  quickFilters, 
  activeFilters,
  onFilterToggle,
  showFilters,
  onFilterModalToggle, 
  viewMode, 
  onViewModeChange 
}: MobileQuickFiltersProps) => {
  return (
    <div className="border-b border-border bg-card sticky top-16 z-40 md:top-20">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <Button 
            variant="outline" 
            onClick={onFilterModalToggle}
            className="flex items-center space-x-2 h-10"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilters.length > 0 && (
              <span className="bg-brand-green text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilters.length}
              </span>
            )}
          </Button>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('map')}
              className="rounded-l-none h-8 w-8 p-0"
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickFilters.map((filter) => (
            <Badge 
              key={filter} 
              variant={activeFilters.includes(filter) ? "default" : "outline"}
              className={`whitespace-nowrap cursor-pointer px-4 py-2 h-8 ${
                activeFilters.includes(filter) 
                  ? 'bg-brand-green hover:bg-brand-green/90 text-white' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => onFilterToggle(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileQuickFilters;
