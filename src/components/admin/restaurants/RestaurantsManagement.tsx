import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";
import { useAdminRestaurants, type RestaurantFilters } from "@/hooks/useAdminRestaurants";
import { RestaurantStatsCards } from "./RestaurantStatsCards";
import { RestaurantsTable } from "./RestaurantsTable";
import { RestaurantDetailModal } from "./RestaurantDetailModal";

export const RestaurantsManagement = () => {
  const { fetchRestaurants, getRestaurantStats, toggleActive, toggleFeatured } = useAdminRestaurants();
  const [filters, setFilters] = useState<RestaurantFilters>({});
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: restaurants, isLoading, refetch } = useQuery({
    queryKey: ["admin-restaurants", filters],
    queryFn: () => fetchRestaurants(filters),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-restaurant-stats"],
    queryFn: getRestaurantStats,
  });

  const handleViewDetails = (restaurant: any) => {
    setSelectedRestaurantId(restaurant.id);
    setIsDetailModalOpen(true);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActive.mutate({ id, isActive }, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const handleToggleFeatured = (id: string, featured: boolean) => {
    toggleFeatured.mutate({ id, featured }, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Restaurants Management</h2>
          <p className="text-muted-foreground">Manage all restaurants on the platform</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {stats && <RestaurantStatsCards stats={stats} />}

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Input
              placeholder="City"
              value={filters.city || ""}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />

            <Select
              value={filters.priceRange || "all"}
              onValueChange={(value) => 
                setFilters({ ...filters, priceRange: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="1">$</SelectItem>
                <SelectItem value="2">$$</SelectItem>
                <SelectItem value="3">$$$</SelectItem>
                <SelectItem value="4">$$$$</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isActive === undefined ? "all" : filters.isActive ? "active" : "inactive"}
              onValueChange={(value) => 
                setFilters({ 
                  ...filters, 
                  isActive: value === "all" ? undefined : value === "active" 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.featured === undefined ? "all" : filters.featured ? "featured" : "not_featured"}
              onValueChange={(value) => 
                setFilters({ 
                  ...filters, 
                  featured: value === "all" ? undefined : value === "featured" 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="not_featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading restaurants...</div>
          ) : restaurants ? (
            <RestaurantsTable
              restaurants={restaurants as any}
              onViewDetails={handleViewDetails}
              onToggleActive={handleToggleActive}
              onToggleFeatured={handleToggleFeatured}
            />
          ) : null}
        </div>
      </Card>

      <RestaurantDetailModal
        restaurantId={selectedRestaurantId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onToggleActive={handleToggleActive}
        onToggleFeatured={handleToggleFeatured}
      />
    </div>
  );
};

export default RestaurantsManagement;
