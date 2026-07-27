
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ResultsHeaderProps {
  propertiesCount: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  searchSummary?: string;
}

const ResultsHeader = ({ propertiesCount, sortBy, onSortChange, searchSummary }: ResultsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          {searchSummary || 'Stay anywhere with content collaboration'}
        </h1>
        <p className="text-muted-foreground">
          {propertiesCount} collaboration opportunities available
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ai-match">Best AI Match</SelectItem>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ResultsHeader;
