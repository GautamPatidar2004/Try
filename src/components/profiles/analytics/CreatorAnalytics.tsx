import { useState } from 'react';
import { useCreatorAnalytics } from '@/hooks/useCreatorAnalytics';
import { AnalyticsOverviewCards } from './AnalyticsOverviewCards';
import { PlatformBreakdown } from './PlatformBreakdown';
import { EngagementChart } from './EngagementChart';
import { ContentPerformanceGrid } from './ContentPerformanceGrid';
import { AnalyticsFilters } from './AnalyticsFilters';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportCreatorAnalytics } from '@/utils/exportAnalytics';

interface CreatorAnalyticsProps {
  userId: string;
}

export const CreatorAnalytics = ({ userId }: CreatorAnalyticsProps) => {
  const [dateRange, setDateRange] = useState(30);
  const { toast } = useToast();
  const {
    overview,
    platformStats,
    contentPerformance,
    topPosts,
    loading,
    refetch,
  } = useCreatorAnalytics(userId, dateRange);

  const handleExport = () => {
    try {
      exportCreatorAnalytics(
        {
          overview,
          platformStats,
          contentPerformance,
          topPosts,
          collaborationImpact: { totalCollaborations: 0, avgEngagement: 0, successRate: overview.collaborationSuccessRate }
        },
        dateRange
      );
      toast({
        title: 'Export Complete',
        description: 'Your analytics report has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Track your performance across all platforms and collaborations
        </p>
      </div>

      <AnalyticsFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={refetch}
        onExport={handleExport}
      />

      <AnalyticsOverviewCards stats={overview} />

      <PlatformBreakdown platforms={platformStats} />

      <EngagementChart data={contentPerformance} />

      <ContentPerformanceGrid posts={topPosts} />
    </div>
  );
};
