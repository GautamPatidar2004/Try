import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Map, Grid3X3 } from "lucide-react";
interface QuickFiltersProps {
  quickFilters: string[];
  activeFilters: string[];
  onQuickFilterToggle: (filter: string) => void;
  showFilters: boolean;
  onShowFiltersToggle: () => void;
  viewMode: 'grid' | 'map';
  onViewModeChange: (mode: 'grid' | 'map') => void;
}
const QuickFilters = ({
  quickFilters,
  activeFilters,
  onQuickFilterToggle,
  showFilters,
  onShowFiltersToggle,
  viewMode,
  onViewModeChange
}: QuickFiltersProps) => {
  return <div className="border-b border-border bg-card sticky top-20 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
        <div className="flex items-center justify-between py-[49px]">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {quickFilters.map(filter => <Badge key={filter} variant={activeFilters.includes(filter) ? "default" : "outline"} className={`whitespace-nowrap cursor-pointer px-4 py-2 ${activeFilters.includes(filter) ? 'bg-brand-green hover:bg-brand-green/90 text-white' : 'hover:bg-muted'}`} onClick={() => onQuickFilterToggle(filter)}>
                {filter}
              </Badge>)}
          </div>
          
          <div className="flex items-center space-x-3 ml-4">
            <Button variant="outline" onClick={onShowFiltersToggle} className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilters.length > 0 && <span className="bg-brand-green text-white text-xs px-1.5 py-0.5 rounded-full">
                  {activeFilters.length}
                </span>}
            </Button>
            
            <div className="flex items-center border rounded-lg">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => onViewModeChange('grid')} className="rounded-r-none">
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'map' ? 'default' : 'ghost'} size="sm" onClick={() => onViewModeChange('map')} className="rounded-l-none">
                <Map className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default QuickFilters;