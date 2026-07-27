import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatorData } from "@/hooks/useCreatorData";
import {
  useCreatorMarketplace,
  CreatorFilterOptions,
} from "@/hooks/useCreatorMarketplace";
import CreatorCard from "@/components/CreatorCard";
import CreatorFilterSidebar from "@/components/creators/CreatorFilterSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  X,
  Sparkles,
  TrendingUp,
  Instagram,
  Youtube,
  Music,
  Twitter,
  ShieldCheck,
  Crown,
  Star,
  MapPin,
  DollarSign,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreatorFilterContent } from "./CreatorFilterContent";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { InfiniteSentinel } from "@/components/shared/InfiniteSentinel";
import { CreatorGridSkeleton } from "./CreatorCardSkeleton";

const CREATORS_BATCH = 24;
// Helper function to get icon for filter type
const getFilterIcon = (filterType: keyof CreatorFilterOptions) => {
  switch (filterType) {
    case "platforms":
      return <Instagram className="h-3 w-3" />;
    case "contentNiches":
      return <Sparkles className="h-3 w-3" />;
    case "collaborationTypes":
      return <Users className="h-3 w-3" />;
    case "location":
      return <MapPin className="h-3 w-3" />;
    case "verifiedOnly":
      return <ShieldCheck className="h-3 w-3" />;
    case "premiumOnly":
      return <Crown className="h-3 w-3" />;
    case "minRating":
      return <Star className="h-3 w-3" />;
    case "followerRange":
      return <Users className="h-3 w-3" />;
    case "engagementRate":
      return <Zap className="h-3 w-3" />;
    case "rateRange":
      return <DollarSign className="h-3 w-3" />;
    default:
      return null;
  }
};

interface CreatorMarketplaceProps {
  isDemoMode?: boolean;
  initialCreatorId?: string;
  onCloseDeepLink?: () => void;
}

const CreatorMarketplace = ({
  isDemoMode = false,
  initialCreatorId,
  onCloseDeepLink,
}: CreatorMarketplaceProps) => {
  const navigate = useNavigate();
  const { creators, loading } = useCreatorData(isDemoMode);
  const marketplace = useCreatorMarketplace(creators);

  // Incremental rendering: only mount a growing window of cards instead of all
  // ~500+ at once (which caused blank-on-scroll from the staggered fade-in +
  // hundreds of backdrop-blur cards). More append as the sentinel nears the bottom.
  const filteredCreators = marketplace.filteredCreators;
  const [visibleCount, setVisibleCount] = useState(CREATORS_BATCH);
  const filterSignature = `${filteredCreators.length}:${filteredCreators[0]?.id ?? ""}:${filteredCreators[filteredCreators.length - 1]?.id ?? ""}`;
  useEffect(() => {
    setVisibleCount(CREATORS_BATCH);
  }, [filterSignature]);
  const visibleCreators = filteredCreators.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCreators.length;
  const loadMore = useCallback(
    () => setVisibleCount((c) => c + CREATORS_BATCH),
    [],
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { trackMarketplaceFilterChange } = useProductAnalytics();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const prevFiltersRef = useRef<string>("");

  // Track filter changes with debouncing
  useEffect(() => {
    const filtersKey = JSON.stringify(marketplace.filters);
    if (prevFiltersRef.current && prevFiltersRef.current !== filtersKey) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        // Find which filter changed
        const prev = prevFiltersRef.current
          ? JSON.parse(prevFiltersRef.current)
          : {};
        const curr = marketplace.filters;
        for (const key of Object.keys(curr) as (keyof CreatorFilterOptions)[]) {
          if (JSON.stringify(prev[key]) !== JSON.stringify(curr[key])) {
            trackMarketplaceFilterChange({
              filter_name: key,
              value: String(curr[key]),
            });
            break;
          }
        }
      }, 500);
    }
    prevFiltersRef.current = filtersKey;
  }, [marketplace.filters, trackMarketplaceFilterChange]);

  const quickFilters = [
    "Top Rated",
    "High Following",
    "Travel",
    "Lifestyle",
    "Fashion",
    "Food",
  ];
  // Inside CreatorMarketplace component, after creators loads:
  const creatorIds = useMemo(
    () => creators.map((c) => c.id).filter(Boolean),
    [creators],
  );

  const { data: verifiedMap } = useQuery({
    queryKey: ["creator-verified-bulk", creatorIds],
    queryFn: async () => {
      if (!creatorIds.length) return {};
      const { data } = await supabase
        .from("subscriptions")
        .select("influencer_id, subscription_plans!inner(has_verified_badge)")
        .in("influencer_id", creatorIds)
        .eq("status", "active");

      const map: Record<string, boolean> = {};
      type VerifiedRow = {
        influencer_id: string;
        subscription_plans: { has_verified_badge: boolean } | null;
      };
      ((data ?? []) as VerifiedRow[]).forEach((s) => {
        map[s.influencer_id] =
          s.subscription_plans?.has_verified_badge || false;
      });
      return map;
    },
    enabled: creatorIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-[80px] p-6">
        <CreatorGridSkeleton count={9} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background pt-[80px]">
      {/* Desktop Sidebar - Hidden on mobile/tablet, visible on lg+ */}
      <aside className="hidden lg:block flex-shrink-0">
        <CreatorFilterSidebar
          filters={marketplace.filters}
          onFiltersChange={marketplace.setFilters}
          activeFilterCount={marketplace.activeFilterCount}
          onClearAll={marketplace.clearAllFilters}
        />
      </aside>

      {/* Mobile Filters Sheet */}
      <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="flex items-center justify-between">
              <span>Filters</span>
              {marketplace.activeFilterCount > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {marketplace.activeFilterCount}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* Scrollable filter content */}
          <ScrollArea className="flex-1 px-6">
            <div className="py-6">
              <CreatorFilterContent
                filters={marketplace.filters}
                onFiltersChange={marketplace.setFilters}
              />
            </div>
          </ScrollArea>

          {/* Action buttons at bottom */}
          <div className="p-6 border-t bg-background space-y-3">
            {marketplace.activeFilterCount > 0 && (
              <Button
                variant="outline"
                onClick={marketplace.clearAllFilters}
                className="w-full rounded-xl"
              >
                Clear all filters
              </Button>
            )}
            <Button
              onClick={() => setShowMobileFilters(false)}
              className="w-full rounded-xl"
            >
              Show {marketplace.filteredCreators.length} results
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-gradient-to-b from-background to-muted/20">
        {/* Enhanced Sticky Header with Search and Sort */}
        <div className="bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur-xl border-b shadow-sm">
          <div className="p-6 space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  placeholder="Search by name, location, or specialty..."
                  value={marketplace.searchQuery}
                  onChange={(e) => marketplace.setSearchQuery(e.target.value)}
                  className="pl-12 pr-10 h-12 text-base border-2 focus:border-primary/50 bg-background/50 rounded-xl"
                />
                {marketplace.searchQuery && (
                  <button
                    onClick={() => marketplace.setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 h-12 px-5 rounded-xl"
              >
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filters</span>
                {marketplace.activeFilterCount > 0 && (
                  <Badge
                    variant="default"
                    className="rounded-full ml-1 bg-primary"
                  >
                    {marketplace.activeFilterCount}
                  </Badge>
                )}
              </Button>

              <Select
                value={marketplace.sortBy}
                onValueChange={marketplace.setSortBy}
              >
                <SelectTrigger className="w-52 h-12 border-2 bg-background/50 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="followers">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Most Followers
                    </div>
                  </SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Highest Rated
                    </div>
                  </SelectItem>
                  <SelectItem value="engagement">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Best Engagement
                    </div>
                  </SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filter Chips */}
            {marketplace.getActiveFilterBadges().length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {marketplace.getActiveFilterBadges().map((badge) => (
                  <Badge
                    key={`${badge.type}-${badge.value}`}
                    variant="secondary"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer rounded-full"
                    onClick={() =>
                      marketplace.removeFilter(badge.type, badge.value)
                    }
                  >
                    {getFilterIcon(badge.type)}
                    <span>{badge.label}</span>
                    <X className="h-3 w-3 ml-1 hover:scale-110 transition-transform" />
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={marketplace.clearAllFilters}
                  className="text-muted-foreground hover:text-foreground text-sm h-8"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  <span className="text-2xl font-bold text-primary">
                    {marketplace.filteredCreators.length}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    creators found
                  </span>
                </p>
                {marketplace.activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {marketplace.activeFilterCount} filters applied
                  </Badge>
                )}
              </div>
            </div>

            {/* Enhanced Quick Filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {quickFilters.map((filter) => {
                const isActive =
                  marketplace.activeQuickFilters.includes(filter);
                return (
                  <Badge
                    key={filter}
                    variant={isActive ? "default" : "outline"}
                    className={`
                      cursor-pointer whitespace-nowrap px-4 py-2 text-sm font-medium rounded-xl
                      transition-all duration-200 hover:scale-105
                      ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-primary/80 hover:shadow-md"
                          : "hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                      }
                    `}
                    onClick={() => marketplace.handleQuickFilterToggle(filter)}
                  >
                    {filter}
                    {isActive && <X className="ml-2 h-3.5 w-3.5" />}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        {/* Creator Grid with Animation */}
        <div className="p-6">
          {marketplace.filteredCreators.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No creators found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search query to find more
                  creators
                </p>
                <Button
                  variant="default"
                  onClick={marketplace.clearAllFilters}
                  className="hover:shadow-md transition-all rounded-xl"
                >
                  Clear all filters
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleCreators.map((creator, index) => (
                  <div
                    key={creator.id}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${(index % CREATORS_BATCH) * 30}ms`,
                    }}
                  >
                    <CreatorCard
                      creator={creator}
                      isDemoMode={isDemoMode}
                      autoOpenPortfolio={initialCreatorId === creator.id}
                      hasVerifiedBadge={
                        verifiedMap?.[creator.id] ?? creator.verified ?? false
                      }
                      onPortfolioClose={
                        initialCreatorId === creator.id
                          ? onCloseDeepLink
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
              <InfiniteSentinel onLoadMore={loadMore} enabled={hasMore} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreatorMarketplace;
