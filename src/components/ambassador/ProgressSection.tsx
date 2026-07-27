import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Award, Target, TrendingUp, Book, BarChart3 } from "lucide-react";
import { ReferralSegmentTabs } from "./referrals/ReferralSegmentTabs";
import { MonthlyRequirementsWidget } from "./MonthlyRequirementsWidget";
import { AmbassadorBadges } from "./gamification/AmbassadorBadges";
import { TierProgressTracker } from "./gamification/TierProgressTracker";
import { ContentHub } from "./education/ContentHub";
import { PerformanceAnalytics } from "./analytics/PerformanceAnalytics";
import { BrandCard } from "@/components/ui/brand-card";

export const ProgressSection = () => {
  const [activeTab, setActiveTab] = useState("referrals");

  return (
    <BrandCard variant="elevated" className="overflow-hidden p-0">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Scrollable tabs with touch-friendly sizing */}
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 overflow-x-auto scrollbar-hide flex-nowrap">
          <TabsTrigger 
            value="referrals"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent px-3 sm:px-4 py-3 min-h-[44px] whitespace-nowrap touch-manipulation"
          >
            <Users className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Referrals</span>
            <span className="xs:hidden">Refs</span>
          </TabsTrigger>
          <TabsTrigger 
            value="requirements"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent px-3 sm:px-4 py-3 min-h-[44px] whitespace-nowrap touch-manipulation"
          >
            <Target className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Requirements</span>
            <span className="xs:hidden">Reqs</span>
          </TabsTrigger>
          <TabsTrigger 
            value="education"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent px-3 sm:px-4 py-3 min-h-[44px] whitespace-nowrap touch-manipulation"
          >
            <Book className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Education</span>
            <span className="xs:hidden">Learn</span>
          </TabsTrigger>
          <TabsTrigger 
            value="badges"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent px-3 sm:px-4 py-3 min-h-[44px] whitespace-nowrap touch-manipulation"
          >
            <Award className="h-4 w-4 mr-1 sm:mr-2" />
            Badges
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent px-3 sm:px-4 py-3 min-h-[44px] whitespace-nowrap touch-manipulation"
          >
            <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Analytics</span>
            <span className="xs:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger 
            value="tier"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent px-3 sm:px-4 py-3 min-h-[44px] whitespace-nowrap touch-manipulation"
          >
            <TrendingUp className="h-4 w-4 mr-1 sm:mr-2" />
            Tier
          </TabsTrigger>
        </TabsList>

        <div className="p-3 sm:p-4">
          <TabsContent value="referrals" className="m-0 animate-fade-in">
            <ReferralSegmentTabs />
          </TabsContent>
          
          <TabsContent value="requirements" className="m-0 animate-fade-in">
            <MonthlyRequirementsWidget />
          </TabsContent>

          <TabsContent value="education" className="m-0 animate-fade-in">
            <ContentHub />
          </TabsContent>
          
          <TabsContent value="badges" className="m-0 animate-fade-in">
            <AmbassadorBadges variant="compact" />
          </TabsContent>

          <TabsContent value="analytics" className="m-0 animate-fade-in">
            <PerformanceAnalytics />
          </TabsContent>
          
          <TabsContent value="tier" className="m-0 animate-fade-in">
            <TierProgressTracker variant="compact" />
          </TabsContent>
        </div>
      </Tabs>
    </BrandCard>
  );
};
