import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useMarketplace,
  FilterOptions,
  Property,
} from "@/hooks/useMarketplace";
import { useMarketplaceData } from "@/hooks/useMarketplaceData";
import { useAIMatches } from "@/hooks/useAIMatches";
import { supabase } from "@/integrations/supabase/client";
import { demoProperties } from "@/data/demoProperties";
import AirbnbPropertyCard from "@/components/AirbnbPropertyCard";
import MobilePropertyCard from "./MobilePropertyCard";
import MobileMapView from "./MobileMapView";
import { PropertyMapLazy as PropertyMap } from "./PropertyMapLazy";
import { VirtualizedPropertyGrid } from "./VirtualizedPropertyGrid";
import { PropertyGridSkeleton } from "./PropertyCardSkeleton";
import PropertyDetailModal from "./PropertyDetailModal";
import CollaborationApplicationModal from "./CollaborationApplicationModal";
import { StaysFilterSidebar } from "./StaysFilterSidebar";
import { StaysSearchHeader } from "./StaysSearchHeader";
import { StaysFilterContent } from "./StaysFilterContent";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";

interface InfluencerMarketplaceProps {
  isDemoMode?: boolean;
  initialPropertyId?: string;
  onCloseDeepLink?: () => void;
}

const InfluencerMarketplace = ({
  isDemoMode = false,
  initialPropertyId,
  onCloseDeepLink,
}: InfluencerMarketplaceProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [showPropertyDetail, setShowPropertyDetail] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { trackMarketplaceFilterChange } = useProductAnalytics();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const prevFiltersRef = useRef<string>("");

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);

  // Use demo properties in demo mode, otherwise fetch real properties from database
  const { properties: realProperties, loading: propertiesLoading } =
    useMarketplaceData();
  const properties = isDemoMode ? demoProperties : realProperties;
  const loading = isDemoMode ? false : propertiesLoading;

  // Get AI matches for the current user
  const { matches, getMatchForProperty } = useAIMatches(userId, "influencer");

  const {
    searchQuery,
    searchParams,
    activeQuickFilters,
    selectedProperty,
    sortBy,
    filters,
    filteredProperties,
    activeFilterCount,
    handleSearch,
    handleQuickFilterToggle,
    setSelectedProperty,
    setSortBy,
    setFilters,
    clearAllFilters,
  } = useMarketplace(properties);

  // Track filter changes with debouncing
  useEffect(() => {
    const filtersKey = JSON.stringify(filters);
    if (prevFiltersRef.current && prevFiltersRef.current !== filtersKey) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const prev = prevFiltersRef.current
          ? JSON.parse(prevFiltersRef.current)
          : {};
        for (const key of Object.keys(filters) as (keyof FilterOptions)[]) {
          if (JSON.stringify(prev[key]) !== JSON.stringify(filters[key])) {
            trackMarketplaceFilterChange({
              filter_name: key,
              value: String(filters[key]),
            });
            break;
          }
        }
      }, 500);
    }
    prevFiltersRef.current = filtersKey;
  }, [filters, trackMarketplaceFilterChange]);

  // Wrapper function to handle partial filter updates
  const handleFiltersChange = (partial: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  // Handler to remove individual filters from the search header chips
  const handleRemoveFilter = useCallback(
    (type: keyof FilterOptions, value?: string) => {
      switch (type) {
        case "propertyTypes":
          setFilters((prev) => ({
            ...prev,
            propertyTypes: prev.propertyTypes.filter((t) => t !== value),
          }));
          break;
        case "amenities":
          setFilters((prev) => ({
            ...prev,
            amenities: prev.amenities.filter((a) => a !== value),
          }));
          break;
        case "collaborationTypes":
          setFilters((prev) => ({
            ...prev,
            collaborationTypes: prev.collaborationTypes.filter(
              (c) => c !== value,
            ),
          }));
          break;
        case "priceRange":
          setFilters((prev) => ({
            ...prev,
            priceRange: [0, 1000],
          }));
          break;
        case "superhostOnly":
          setFilters((prev) => ({
            ...prev,
            superhostOnly: false,
          }));
          break;
        case "instantBookOnly":
          setFilters((prev) => ({
            ...prev,
            instantBookOnly: false,
          }));
          break;
        default:
          break;
      }
    },
    [setFilters],
  );

  // Enhance properties with AI match data
  const propertiesWithMatches = filteredProperties.map((property) => {
    const match = getMatchForProperty(property.id);
    return {
      ...property,
      aiMatch: match,
    };
  });

  // Sort by AI match if requested
  const sortedProperties =
    sortBy === "ai-match" && userId
      ? [...propertiesWithMatches].sort((a, b) => {
          const scoreA = a.aiMatch?.match_score || 0;
          const scoreB = b.aiMatch?.match_score || 0;
          return scoreB - scoreA;
        })
      : propertiesWithMatches;

  const quickFilters = [
    "Superhost",
    "Free Stay",
    "Pool",
    "WiFi",
    "Kitchen",
    "Pet Friendly",
  ];

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setShowPropertyDetail(true);
  };

  // Auto-open property modal when arriving via /stays/:propertyId
  const deepLinkOpenedRef = useRef(false);
  useEffect(() => {
    if (!initialPropertyId || loading || deepLinkOpenedRef.current) return;
    const match = properties.find((p: Property) => p.id === initialPropertyId);
    if (match) {
      setSelectedProperty(match);
      setShowPropertyDetail(true);
      deepLinkOpenedRef.current = true;
    }
  }, [initialPropertyId, loading, properties, setSelectedProperty]);

  const handleCloseDetail = () => {
    setShowPropertyDetail(false);
    onCloseDeepLink?.();
  };

  const handleApplyClick = (property: Property) => {
    if (isDemoMode) {
      navigate("/auth");
      return;
    }
    setSelectedProperty(property);
    setShowApplicationModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-[80px] p-6">
        <PropertyGridSkeleton count={9} />
      </div>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <>
        <div className="pb-20 pt-[72px]">
          {viewMode === "map" ? (
            <MobileMapView
              properties={sortedProperties}
              activeFilters={activeQuickFilters}
              searchQuery={searchQuery}
              onPropertySelect={handlePropertyClick}
            />
          ) : (
            <>
              <StaysSearchHeader
                searchQuery={searchQuery}
                onSearchChange={(query) => handleSearch(query)}
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultCount={sortedProperties.length}
                onMobileFilterToggle={() => setShowFilters(true)}
                showAIMatch={!!userId}
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
              />
              <div className="px-4 pt-4">
                <VirtualizedPropertyGrid
                  items={sortedProperties}
                  getKey={(property) => property.id}
                  columns={1}
                  gap={16}
                  estimateRowHeight={360}
                  renderItem={(property) => (
                    <MobilePropertyCard
                      property={property}
                      onClick={() => handlePropertyClick(property)}
                      onApplyClick={() => handleApplyClick(property)}
                    />
                  )}
                />
              </div>
            </>
          )}

          {/* Floating Map/List toggle */}
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "map" : "grid")}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 bg-foreground text-background px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
          >
            {viewMode === "grid" ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
                  <path d="M15 5.764v15" />
                  <path d="M9 3.236v15" />
                </svg>
                Map
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" x2="21" y1="6" y2="6" />
                  <line x1="8" x2="21" y1="12" y2="12" />
                  <line x1="8" x2="21" y1="18" y2="18" />
                  <line x1="3" x2="3.01" y1="6" y2="6" />
                  <line x1="3" x2="3.01" y1="12" y2="12" />
                  <line x1="3" x2="3.01" y1="18" y2="18" />
                </svg>
                List
              </>
            )}
          </button>
        </div>

        {/* Mobile Filter Sheet */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear all ({activeFilterCount})
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <StaysFilterContent
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
            <div className="sticky bottom-0 bg-background border-t pt-4 mt-6">
              <Button className="w-full" onClick={() => setShowFilters(false)}>
                Show {sortedProperties.length} results
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <PropertyDetailModal
          property={selectedProperty}
          isOpen={showPropertyDetail}
          onClose={handleCloseDetail}
          isDemoMode={isDemoMode}
        />

        <CollaborationApplicationModal
          property={selectedProperty}
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
        />
      </>
    );
  }

  // Desktop View
  return (
    <>
      <div className="flex min-h-screen bg-background pt-[80px]">
        {/* Filter Sidebar - Always visible on desktop */}
        <aside className="hidden lg:block flex-shrink-0">
          <StaysFilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            activeFilterCount={activeFilterCount}
            onClearAll={clearAllFilters}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <StaysSearchHeader
            searchQuery={searchQuery}
            onSearchChange={(query) => handleSearch(query)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={sortedProperties.length}
            onMobileFilterToggle={() => setShowFilters(true)}
            showAIMatch={!!userId}
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
          />

          <div className="p-6 pt-8">
            {viewMode === "map" ? (
              <div className="h-[calc(100vh-12rem)]">
                <PropertyMap
                  properties={sortedProperties}
                  activeFilters={activeQuickFilters}
                  searchQuery={searchQuery}
                  onPropertySelect={handlePropertyClick}
                />
              </div>
            ) : (
              <VirtualizedPropertyGrid
                items={sortedProperties}
                getKey={(property) => property.id}
                minColumnWidth={320}
                gap={24}
                estimateRowHeight={380}
                renderItem={(property) => (
                  <AirbnbPropertyCard
                    property={property}
                    onClick={() => handlePropertyClick(property)}
                  />
                )}
              />
            )}
          </div>
        </main>
      </div>

      <PropertyDetailModal
        property={selectedProperty}
        isOpen={showPropertyDetail}
        onClose={handleCloseDetail}
        isDemoMode={isDemoMode}
      />

      <CollaborationApplicationModal
        property={selectedProperty}
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
      />
    </>
  );
};

export default InfluencerMarketplace;
