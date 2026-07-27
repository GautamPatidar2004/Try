import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { FilterOptions } from "@/hooks/useMarketplace";
import { StaysFilterContent } from "./StaysFilterContent";

interface StaysFilterSidebarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
  activeFilterCount: number;
  onClearAll: () => void;
}

export const StaysFilterSidebar = ({
  filters,
  onFiltersChange,
  activeFilterCount,
  onClearAll,
}: StaysFilterSidebarProps) => {
  return (
    <div className="w-80 bg-gradient-to-br from-background via-background to-muted/10 border-r sticky top-[80px] h-[calc(100vh-80px)] flex flex-col shadow-sm">
      {/* Header with gradient */}
      <div className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Filters</h2>
              <p className="text-xs text-muted-foreground">Refine your search</p>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <Badge variant="default" className="rounded-full bg-primary/90 hover:bg-primary">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="w-full text-xs mt-3 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors rounded-xl"
          >
            Clear all filters
          </Button>
        )}
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-1">
          <StaysFilterContent 
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <div className="p-4 border-t bg-gradient-to-t from-muted/20 to-transparent">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>AI-powered matching</span>
        </div>
      </div>
    </div>
  );
};

export default StaysFilterSidebar;
