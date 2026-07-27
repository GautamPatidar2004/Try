import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreatorAnalytics } from './CreatorAnalytics';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';
import { InstagramAnalytics } from './InstagramAnalytics';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Sparkles,
  Instagram,
  Lock,
} from 'lucide-react';

interface EnhancedAnalyticsDashboardProps {
  userId: string;
  userType?: 'influencer' | 'host' | 'brand';
}

const premiumAnalyticsTabs = ['ai-insights'];

export const EnhancedAnalyticsDashboard = ({ userId, userType = 'influencer' }: EnhancedAnalyticsDashboardProps) => {
  const { hasFeature } = useSubscription();

  const hasAdvancedAnalytics = hasFeature('advancedAnalytics');
  const isTabLocked = (tabValue: string): boolean => {
    if (premiumAnalyticsTabs.includes(tabValue)) {
      return !hasAdvancedAnalytics;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Enhanced Analytics</h2>
        <p className="text-muted-foreground">
          Comprehensive insights to help you grow your influence
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50 rounded-lg w-full overflow-x-auto">
          <TabsTrigger value="overview" className="gap-2 flex-shrink-0 px-3 py-2 text-sm">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="ai-insights"
            disabled={isTabLocked('ai-insights')}
            className={`gap-2 flex-shrink-0 px-3 py-2 text-sm ${isTabLocked('ai-insights') ? 'opacity-60' : ''}`}
          >
            {isTabLocked('ai-insights') && <Lock className="w-3 h-3" />}
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Insights</span>
            {isTabLocked('ai-insights') && <Badge variant="outline" className="ml-1 text-xs hidden lg:inline">Pro</Badge>}
          </TabsTrigger>
          <TabsTrigger value="instagram" className="gap-2 flex-shrink-0 px-3 py-2 text-sm">
            <Instagram className="w-4 h-4" />
            <span className="hidden sm:inline">Instagram</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CreatorAnalytics userId={userId} />
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-6">
          {isTabLocked('ai-insights') ? (
            <UpgradePrompt feature="advancedAnalytics" />
          ) : (
            <AIRecommendationsPanel userId={userId} />
          )}
        </TabsContent>

        <TabsContent value="instagram" className="mt-6">
          <InstagramAnalytics userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
