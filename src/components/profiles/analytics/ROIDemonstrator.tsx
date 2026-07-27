import { useROIMetrics } from '@/hooks/useROIMetrics';
import { CollaborationROICard } from './CollaborationROICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, DollarSign, Briefcase } from 'lucide-react';

interface ROIDemonstratorProps {
  userId: string;
}

export const ROIDemonstrator = ({ userId }: ROIDemonstratorProps) => {
  const { collaborations, aggregateMetrics, loading } = useROIMetrics(userId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (collaborations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Collaborations Yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Once you complete collaborations with properties, your ROI metrics will appear here to help you demonstrate your value.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Total Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(aggregateMetrics.totalReach)}</p>
            <p className="text-xs text-muted-foreground mt-1">Across all collaborations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Average ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {aggregateMetrics.averageROI > 0 ? '+' : ''}
              {aggregateMetrics.averageROI.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Return on investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-500" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(aggregateMetrics.totalValueDelivered)}</p>
            <p className="text-xs text-muted-foreground mt-1">Estimated value delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              Collaborations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{aggregateMetrics.collaborationCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(aggregateMetrics.totalRevenue)} total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Collaboration ROIs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Collaboration Performance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {collaborations.map((collab) => (
            <CollaborationROICard
              key={collab.id}
              propertyName={collab.propertyName}
              agreedRate={collab.agreedRate}
              currency={collab.currency}
              status={collab.status}
              metrics={collab.metrics}
              propertyImage={collab.propertyImage}
            />
          ))}
        </div>
      </div>

      {/* Value Proposition Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Your Value Proposition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Use these data-driven talking points when pitching to new properties:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span className="text-sm">
                Delivered an average of <strong>{formatNumber(aggregateMetrics.totalReach / aggregateMetrics.collaborationCount)}</strong> reach per collaboration
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span className="text-sm">
                Generated <strong>{aggregateMetrics.averageROI.toFixed(0)}%</strong> average return on investment for past partners
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span className="text-sm">
                Created <strong>{formatCurrency(aggregateMetrics.totalValueDelivered)}</strong> in total estimated value across {aggregateMetrics.collaborationCount} partnerships
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
