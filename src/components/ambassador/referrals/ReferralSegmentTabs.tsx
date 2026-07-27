import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Briefcase, UtensilsCrossed } from "lucide-react";
import { useAmbassadorReferrals, ReferralType, COMMISSION_RATES } from "@/hooks/useAmbassadorReferrals";
import { ReferralFilters } from "./ReferralFilters";
import { ReferralPipeline } from "./ReferralPipeline";
import { CreatorReferralsTable } from "./CreatorReferralsTable";
import { PropertyOwnerReferralsTable } from "./PropertyOwnerReferralsTable";
import { BrandReferralsTable } from "./BrandReferralsTable";
import { RestaurantReferralsTable } from "./RestaurantReferralsTable";
import { Skeleton } from "@/components/ui/skeleton";

const SEGMENTS = [
  { 
    key: 'creator' as ReferralType, 
    label: 'Creators', 
    icon: Users,
    description: COMMISSION_RATES.creator.description 
  },
  { 
    key: 'property_owner' as ReferralType, 
    label: 'Properties', 
    icon: Building2,
    description: COMMISSION_RATES.property_owner.description 
  },
  { 
    key: 'brand' as ReferralType, 
    label: 'Brands', 
    icon: Briefcase,
    description: COMMISSION_RATES.brand.description 
  },
  { 
    key: 'restaurant' as ReferralType, 
    label: 'Restaurants', 
    icon: UtensilsCrossed,
    description: COMMISSION_RATES.restaurant.description 
  },
];

export const ReferralSegmentTabs = () => {
  const [activeSegment, setActiveSegment] = useState<ReferralType>('creator');
  const { 
    referrals, 
    allReferrals,
    isLoading, 
    filters, 
    setFilters, 
    statsBySegment 
  } = useAmbassadorReferrals({ referralType: activeSegment });

  const handleExport = () => {
    // Create CSV content
    const headers = ['Name', 'Signup Date', 'Stage', 'Status', 'Total Earned', 'Lifetime Value'];
    const rows = referrals.map(r => [
      `${r.profile?.first_name || ''} ${r.profile?.last_name || ''}`,
      r.signup_date,
      r.conversion_stage,
      r.status,
      r.total_earned,
      r.lifetime_value
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSegment}-referrals.csv`;
    a.click();
  };

  const handleTabChange = (value: string) => {
    setActiveSegment(value as ReferralType);
    setFilters({ ...filters, referralType: value as ReferralType });
  };

  const getSegmentCount = (segment: ReferralType) => {
    return allReferrals.filter(r => (r.referral_type || 'creator') === segment).length;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeSegment} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          {SEGMENTS.map((segment) => {
            const Icon = segment.icon;
            const count = getSegmentCount(segment.key);
            
            return (
              <TabsTrigger 
                key={segment.key} 
                value={segment.key}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{segment.label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Segment Description */}
        <div className="text-sm text-muted-foreground pt-3 pb-1">
          {SEGMENTS.find(s => s.key === activeSegment)?.description}
        </div>

        {/* Pipeline Visualization */}
        <ReferralPipeline 
          stats={statsBySegment[activeSegment]}
          activeStage={filters.conversionStage}
          onStageClick={(stage) => setFilters({ ...filters, conversionStage: stage })}
        />

        {/* Filters */}
        <ReferralFilters
          filters={filters}
          onFiltersChange={setFilters}
          onExport={handleExport}
        />

        {/* Segment-specific Tables */}
        <TabsContent value="creator" className="mt-4">
          <CreatorReferralsTable referrals={referrals} />
        </TabsContent>
        
        <TabsContent value="property_owner" className="mt-4">
          <PropertyOwnerReferralsTable referrals={referrals} />
        </TabsContent>
        
        <TabsContent value="brand" className="mt-4">
          <BrandReferralsTable referrals={referrals} />
        </TabsContent>
        
        <TabsContent value="restaurant" className="mt-4">
          <RestaurantReferralsTable referrals={referrals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
