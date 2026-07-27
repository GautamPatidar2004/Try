
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MobileSearchHeaderProps {
  onSearch: (query: string) => void;
}

const MobileSearchHeader = ({ onSearch }: MobileSearchHeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsSearchOpen(false);
  };

  return (
    <>
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/37dff50a-de23-4743-b5c6-803312d8f98c.png" 
                alt="Hostfluencer" 
                className="h-6"
              />
              <span className="text-lg font-semibold text-foreground">Discover</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="h-9 w-9"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Properties</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Where do you want to collaborate?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full bg-brand-green hover:bg-brand-green/90">
              Search
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileSearchHeader;
