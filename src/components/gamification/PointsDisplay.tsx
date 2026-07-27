import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { Skeleton } from '@/components/ui/skeleton';

interface PointsDisplayProps {
  userId: string;
  variant?: 'default' | 'compact';
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({ userId, variant = 'default' }) => {
  const { points, loading, getLevelIcon } = usePoints(userId);

  if (loading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (!points) return null;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
        <div className="text-2xl">{getLevelIcon(points.current_level)}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{points.current_level}</span>
            <span className="text-sm font-semibold text-primary">
              {points.total_points.toLocaleString()} pts
            </span>
          </div>
          <Progress value={points.level_progress} className="h-2" />
        </div>
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{getLevelIcon(points.current_level)}</span>
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-xl font-bold">{points.current_level}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <p className="text-2xl font-bold text-primary">
              {points.total_points.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Level Progress</span>
            <span className="font-medium">{points.level_progress}%</span>
          </div>
          <Progress value={points.level_progress} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {points.points_to_next_level > 0 ? (
              <>
                {points.points_to_next_level.toLocaleString()} points to next level
              </>
            ) : (
              <>Max level reached! 🎉</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
