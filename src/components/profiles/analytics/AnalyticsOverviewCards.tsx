import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, FileText, CheckCircle } from 'lucide-react';
import { GrowthIndicator } from './GrowthIndicator';

interface OverviewStats {
  totalReach: number;
  avgEngagementRate: number;
  totalPosts: number;
  collaborationSuccessRate: number;
  reachGrowth: number;        
  engagementGrowth: number;   
  postsGrowth: number;        
  successRateGrowth: number;  
}

interface AnalyticsOverviewCardsProps {
  stats: OverviewStats;
}

export const AnalyticsOverviewCards = ({ stats }: AnalyticsOverviewCardsProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const cards = [
    {
      title: 'Total Reach',
      value: formatNumber(stats.totalReach),
      icon: Users,
      growth: stats.reachGrowth,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Avg. Engagement Rate',
      value: `${stats.avgEngagementRate.toFixed(1)}%`,
      icon: TrendingUp,
      growth: stats.engagementGrowth,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts.toString(),
      icon: FileText,
      growth: stats.postsGrowth,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Success Rate',
      value: `${stats.collaborationSuccessRate.toFixed(0)}%`,
      icon: CheckCircle,
      growth: stats.successRateGrowth,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="glass-effect hover-lift border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <GrowthIndicator value={card.growth} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
