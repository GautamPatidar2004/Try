import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Filter, X, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export interface SegmentFilters {
  userType: string;
  accountStatus: string;
  isVerified: string;
  accountTier: string;
  engagementLevel: string;
  location: string;
  lastLoginDays: string;
  registeredAfter: Date | undefined;
  registeredBefore: Date | undefined;
}

interface SegmentBuilderProps {
  filters: SegmentFilters;
  onFiltersChange: (filters: SegmentFilters) => void;
  recipientCount: number | null;
  isLoading: boolean;
}

const defaultFilters: SegmentFilters = {
  userType: "all",
  accountStatus: "all",
  isVerified: "all",
  accountTier: "all",
  engagementLevel: "all",
  location: "",
  lastLoginDays: "all",
  registeredAfter: undefined,
  registeredBefore: undefined,
};

export const SegmentBuilder = ({
  filters,
  onFiltersChange,
  recipientCount,
  isLoading,
}: SegmentBuilderProps) => {
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "location") return value !== "";
    if (key === "registeredAfter" || key === "registeredBefore") return value !== undefined;
    return value !== "all";
  }).length;

  const handleReset = () => {
    onFiltersChange(defaultFilters);
  };

  const updateFilter = (key: keyof SegmentFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Audience Segmentation
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1">
              <X className="h-3 w-3" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* User Type */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">User Type</Label>
            <Select value={filters.userType} onValueChange={(v) => updateFilter("userType", v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="host">Hosts</SelectItem>
                <SelectItem value="influencer">Creators</SelectItem>
                <SelectItem value="brand">Brands</SelectItem>
                <SelectItem value="restaurant_owner">Restaurant Owners</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Status */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Account Status</Label>
            <Select value={filters.accountStatus} onValueChange={(v) => updateFilter("accountStatus", v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verification */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Verification</Label>
            <Select value={filters.isVerified} onValueChange={(v) => updateFilter("isVerified", v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="unverified">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Tier */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Account Tier</Label>
            <Select value={filters.accountTier} onValueChange={(v) => updateFilter("accountTier", v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Engagement Level */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Engagement Level</Label>
            <Select value={filters.engagementLevel} onValueChange={(v) => updateFilter("engagementLevel", v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High (70-100)</SelectItem>
                <SelectItem value="medium">Medium (30-69)</SelectItem>
                <SelectItem value="low">Low (0-29)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Last Login */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Last Active</Label>
            <Select value={filters.lastLoginDays} onValueChange={(v) => updateFilter("lastLoginDays", v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="inactive90">Inactive 90+ Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Location (contains)</Label>
            <Input
              placeholder="e.g., New York"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Registered After */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Registered After</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-9 justify-start font-normal">
                  {filters.registeredAfter ? format(filters.registeredAfter, "MMM d, yyyy") : "Select date..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.registeredAfter}
                  onSelect={(date) => updateFilter("registeredAfter", date)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Registered Before */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Registered Before</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-9 justify-start font-normal">
                  {filters.registeredBefore ? format(filters.registeredBefore, "MMM d, yyyy") : "Select date..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.registeredBefore}
                  onSelect={(date) => updateFilter("registeredBefore", date)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Recipient Count */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Calculating...
              </span>
            ) : (
              <>
                <strong>{recipientCount ?? 0}</strong> user{recipientCount !== 1 ? "s" : ""} match this segment
              </>
            )}
          </span>
          {activeFiltersCount > 0 && (
            <div className="ml-auto flex gap-1">
              {filters.userType !== "all" && (
                <Badge variant="secondary" className="text-xs">{filters.userType}</Badge>
              )}
              {filters.accountStatus !== "all" && (
                <Badge variant="secondary" className="text-xs">{filters.accountStatus}</Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Hook to fetch recipient count based on filters
export const useSegmentRecipientCount = (filters: SegmentFilters) => {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      setIsLoading(true);
      try {
        // Build filters object for the query
        const queryFilters: Record<string, any> = {};
        
        if (filters.userType !== "all") {
          queryFilters.user_type = filters.userType;
        }
        if (filters.accountStatus === "active") {
          queryFilters.is_active = true;
        } else if (filters.accountStatus === "inactive") {
          queryFilters.is_active = false;
        } else if (filters.accountStatus === "banned") {
          queryFilters.is_banned = true;
        }
        if (filters.isVerified !== "all") {
          queryFilters.verified = filters.isVerified === "verified";
        }
        if (filters.accountTier !== "all") {
          queryFilters.account_tier = filters.accountTier;
        }

        let query = supabase.from("profiles").select("id", { count: "exact", head: true }).match(queryFilters);
        
        if (filters.location) {
          query = query.ilike("location", `%${filters.location}%`);
        }
        if (filters.registeredAfter) {
          query = query.gte("created_at", filters.registeredAfter.toISOString());
        }
        if (filters.registeredBefore) {
          query = query.lte("created_at", filters.registeredBefore.toISOString());
        }

        const { count: resultCount } = await query;
        setCount(resultCount);
      } catch (error) {
        console.error("Error fetching recipient count:", error);
        setCount(null);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchCount, 300);
    return () => clearTimeout(debounce);
  }, [filters]);

  return { count, isLoading };
};
