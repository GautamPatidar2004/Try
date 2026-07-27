import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Heart, 
  DollarSign,
  Target,
  TrendingDown
} from 'lucide-react';

interface ROIMetrics {
  totalLikes: number;
  totalViews: number;
  totalReach: number;
  engagementRate: number;
  costPerEngagement: number;
  costPerThousandImpressions: number;
  estimatedValue: number;
  roi: number;
}

interface CollaborationROICardProps {
  propertyName: string;
  agreedRate: number;
  currency: string;
  status: string;
  metrics: ROIMetrics | null;
  propertyImage?: string;
}

export const CollaborationROICard = ({
  propertyName,
  agreedRate,
  currency,
  status,
  metrics,
  propertyImage,
}: CollaborationROICardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  const roiColor = metrics?.roi 
    ? metrics.roi > 0 
      ? 'text-green-500' 
      : 'text-red-500'
    : 'text-muted-foreground';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{propertyName}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rate: {formatCurrency(agreedRate)}
              </span>
              <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                {status}
              </Badge>
            </div>
          </div>
          {propertyImage && (
            <img 
              src={propertyImage} 
              alt={propertyName}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {metrics ? (
          <>
            {/* ROI Highlight */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {metrics.roi > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm font-medium">Return on Investment</span>
              </div>
              <span className={`text-2xl font-bold ${roiColor}`}>
                {metrics.roi > 0 ? '+' : ''}{metrics.roi.toFixed(1)}%
              </span>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Total Reach</span>
                </div>
                <p className="text-lg font-semibold">{formatNumber(metrics.totalReach)}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span>Engagement</span>
                </div>
                <p className="text-lg font-semibold">{formatNumber(metrics.totalLikes)}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>CPE</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(metrics.costPerEngagement)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>CPM</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(metrics.costPerThousandImpressions)}
                </p>
              </div>
            </div>

            {/* Value Delivered */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Value Delivered</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(metrics.estimatedValue)}
                </span>
              </div>
              <Progress 
                value={Math.min((metrics.estimatedValue / agreedRate) * 100, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {((metrics.estimatedValue / agreedRate) * 100).toFixed(0)}% value vs. rate paid
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No performance data available yet</p>
            <p className="text-xs mt-1">Content deliveries needed to calculate ROI</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
