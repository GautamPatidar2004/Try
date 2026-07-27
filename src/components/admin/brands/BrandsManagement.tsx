import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";
import { useAdminBrands, type BrandFilters } from "@/hooks/useAdminBrands";
import { BrandStatsCards } from "./BrandStatsCards";
import { BrandsTable } from "./BrandsTable";
import { BrandDetailModal } from "./BrandDetailModal";

export const BrandsManagement = () => {
  const { fetchBrands, getBrandStats, verifyBrand } = useAdminBrands();
  const [filters, setFilters] = useState<BrandFilters>({});
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: brands, isLoading, refetch } = useQuery({
    queryKey: ["admin-brands", filters],
    queryFn: () => fetchBrands(filters),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-brand-stats"],
    queryFn: getBrandStats,
  });

  const handleViewDetails = (brand: any) => {
    setSelectedBrandId(brand.id);
    setIsDetailModalOpen(true);
  };

  const handleToggleVerification = (id: string, verified: boolean) => {
    verifyBrand.mutate({ id, verified }, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brands Management</h2>
          <p className="text-muted-foreground">Manage all brands on the platform</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {stats && <BrandStatsCards stats={stats} />}

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.industry || "all"}
              onValueChange={(value) => 
                setFilters({ ...filters, industry: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="beauty">Beauty</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="food">Food & Beverage</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.verified === undefined ? "all" : filters.verified ? "verified" : "unverified"}
              onValueChange={(value) => 
                setFilters({ 
                  ...filters, 
                  verified: value === "all" ? undefined : value === "verified" 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.budgetRange || "all"}
              onValueChange={(value) => 
                setFilters({ ...filters, budgetRange: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Budget Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="under_10k">Under $10k</SelectItem>
                <SelectItem value="10k_50k">$10k - $50k</SelectItem>
                <SelectItem value="50k_100k">$50k - $100k</SelectItem>
                <SelectItem value="over_100k">Over $100k</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading brands...</div>
          ) : brands ? (
            <BrandsTable
              brands={brands as any}
              onViewDetails={handleViewDetails}
              onToggleVerification={handleToggleVerification}
            />
          ) : null}
        </div>
      </Card>

      <BrandDetailModal
        brandId={selectedBrandId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onToggleVerification={handleToggleVerification}
      />
    </div>
  );
};

export default BrandsManagement;
