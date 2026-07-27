
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, User, Plus } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface MarketplaceHeaderProps {
  userType: 'host' | 'creator';
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
}

const MarketplaceHeader = ({ userType, onSearch, onFilterToggle }: MarketplaceHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="bg-background border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/37dff50a-de23-4743-b5c6-803312d8f98c.png" 
              alt="Hostfluencer" 
              className="h-8"
            />
            <h1 className="text-xl font-semibold text-foreground">
              {userType === 'host' ? 'Find Creators' : 'Browse Properties'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4 flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder={userType === 'host' ? 'Search creators...' : 'Search properties...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <Button variant="outline" onClick={onFilterToggle}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button className="bg-brand-green hover:bg-brand-green/90">
              <Plus className="w-4 h-4 mr-2" />
              {userType === 'host' ? 'List Property' : 'Apply to Stay'}
            </Button>
            <Button variant="outline" size="icon">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHeader;
