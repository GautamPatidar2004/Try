import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export interface AdvancedFilters {
  userType?: string;
  accountTier?: string;
  isActive?: boolean;
  isBanned?: boolean;
  isVerified?: boolean;
  hasPremium?: boolean;
  engagementMin?: number;
  engagementMax?: number;
  loginCountMin?: number;
  registeredAfter?: string;
  registeredBefore?: string;
   contentNiches?: string[];
   location?: string;
   hasPlatform?: string[];
   followerMin?: number;
   followerMax?: number;
   collaborationCount?: string;
}

interface AdvancedFiltersPanelProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearFilters: () => void;
}

export const AdvancedFiltersPanel = ({
  filters,
  onFiltersChange,
  onClearFilters,
}: AdvancedFiltersPanelProps) => {
  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearFilters}
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>User Type</Label>
            <Select
              value={filters.userType || ""}
              onValueChange={(value) =>
                updateFilter("userType", value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="influencer">Creator</SelectItem>
                <SelectItem value="host">Host</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
                <SelectItem value="restaurant_owner">Restaurant Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Account Tier</Label>
            <Select
              value={filters.accountTier || ""}
              onValueChange={(value) =>
                updateFilter("accountTier", value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All tiers</SelectItem>
                <SelectItem value="starter">Starter (Free)</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
                <SelectItem value="creator_pro">Creator Pro</SelectItem>
                <SelectItem value="creator_premium">Creator Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={
                filters.isActive === undefined
                  ? ""
                  : filters.isActive
                  ? "active"
                  : "inactive"
              }
              onValueChange={(value) =>
                updateFilter(
                  "isActive",
                  value === "" ? undefined : value === "active"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ban Status</Label>
            <Select
              value={
                filters.isBanned === undefined
                  ? ""
                  : filters.isBanned
                  ? "banned"
                  : "not-banned"
              }
              onValueChange={(value) =>
                updateFilter(
                  "isBanned",
                  value === "" ? undefined : value === "banned"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All users</SelectItem>
                <SelectItem value="not-banned">Not Banned</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Verification</Label>
            <Select
              value={
                filters.isVerified === undefined
                  ? ""
                  : filters.isVerified
                  ? "verified"
                  : "unverified"
              }
              onValueChange={(value) =>
                updateFilter(
                  "isVerified",
                  value === "" ? undefined : value === "verified"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Premium Status</Label>
            <Select
              value={
                filters.hasPremium === undefined
                  ? ""
                  : filters.hasPremium
                  ? "premium"
                  : "free"
              }
              onValueChange={(value) =>
                updateFilter(
                  "hasPremium",
                  value === "" ? undefined : value === "premium"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="premium">Premium/Override</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Registered After</Label>
            <Input
              type="date"
              value={filters.registeredAfter || ""}
              onChange={(e) =>
                updateFilter("registeredAfter", e.target.value || undefined)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Registered Before</Label>
            <Input
              type="date"
              value={filters.registeredBefore || ""}
              onChange={(e) =>
                updateFilter("registeredBefore", e.target.value || undefined)
              }
            />
          </div>
        </div>

         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           <div className="space-y-2">
             <Label>Content Niches</Label>
             <Select
               value={filters.contentNiches?.[0] || ""}
               onValueChange={(value) =>
                 updateFilter("contentNiches", value ? [value] : undefined)
               }
             >
               <SelectTrigger>
                 <SelectValue placeholder="Any niche" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="">Any niche</SelectItem>
                 <SelectItem value="Travel">Travel</SelectItem>
                 <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                 <SelectItem value="Luxury">Luxury</SelectItem>
                 <SelectItem value="Fashion">Fashion</SelectItem>
                 <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                 <SelectItem value="Photography">Photography</SelectItem>
                 <SelectItem value="Adventure">Adventure</SelectItem>
                 <SelectItem value="Wellness">Wellness</SelectItem>
               </SelectContent>
             </Select>
           </div>
 
           <div className="space-y-2">
             <Label>Location</Label>
             <Input
               type="text"
               placeholder="Filter by location..."
               value={filters.location || ""}
               onChange={(e) =>
                 updateFilter("location", e.target.value || undefined)
               }
             />
           </div>
 
           <div className="space-y-2">
             <Label>Collaborations</Label>
             <Select
               value={filters.collaborationCount || ""}
               onValueChange={(value) =>
                 updateFilter("collaborationCount", value || undefined)
               }
             >
               <SelectTrigger>
                 <SelectValue placeholder="Any" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="">Any</SelectItem>
                 <SelectItem value="0">No collaborations</SelectItem>
                 <SelectItem value="1-5">1-5 collaborations</SelectItem>
                 <SelectItem value="5+">5+ collaborations</SelectItem>
               </SelectContent>
             </Select>
           </div>
         </div>
 
         <div className="space-y-2">
           <Label>
             Follower Range: {(filters.followerMin || 0).toLocaleString()} -{" "}
             {filters.followerMax ? filters.followerMax.toLocaleString() : "1M+"}
           </Label>
           <Slider
             min={0}
             max={1000000}
             step={1000}
             value={[filters.followerMin || 0, filters.followerMax || 1000000]}
             onValueChange={([min, max]) => {
               updateFilter("followerMin", min);
               updateFilter("followerMax", max);
             }}
             className="w-full"
           />
         </div>
 
        <div className="space-y-2">
          <Label>
            Engagement Score: {filters.engagementMin || 0} -{" "}
            {filters.engagementMax || 100}
          </Label>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[filters.engagementMin || 0, filters.engagementMax || 100]}
            onValueChange={([min, max]) => {
              updateFilter("engagementMin", min);
              updateFilter("engagementMax", max);
            }}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum Login Count</Label>
          <Input
            type="number"
            placeholder="Any"
            value={filters.loginCountMin || ""}
            onChange={(e) =>
              updateFilter(
                "loginCountMin",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};
