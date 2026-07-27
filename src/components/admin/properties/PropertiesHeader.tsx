
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload } from "lucide-react";

interface PropertiesHeaderProps {
  propertiesCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: string;
  onFilterChange: (status: string) => void;
  onBulkImport?: () => void;
}

const PropertiesHeader = ({
  propertiesCount,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  onBulkImport
}: PropertiesHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <CardTitle>All Properties ({propertiesCount})</CardTitle>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        {onBulkImport && (
          <Button variant="outline" onClick={onBulkImport}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
};

export default PropertiesHeader;
