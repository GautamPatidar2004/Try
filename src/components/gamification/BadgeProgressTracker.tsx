import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useBadgeProgress } from '@/hooks/useBadgeProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, MousePointerClick } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { executeBadgeAction } from '@/lib/badgeActionRouter';

interface BadgeProgressTrackerProps {
  userId: string;
}

export const BadgeProgressTracker: React.FC<BadgeProgressTrackerProps> = ({ userId }) => {
  const { progress, closeToBadges, loading } = useBadgeProgress(userId);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleProgressClick = (badgeName: string) => {
    executeBadgeAction(badgeName, navigate, toast, false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayProgress = closeToBadges.length > 0 ? closeToBadges : progress.slice(0, 3);

  if (displayProgress.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-primary" />
          {closeToBadges.length > 0 ? 'Almost There!' : 'Badge Progress'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayProgress.map((item) => {
            const badge = item.badge as any;
            return (
              <button
                key={item.id}
                onClick={() => handleProgressClick(badge.name)}
                className="w-full space-y-2 text-left p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer border border-transparent hover:border-primary/30 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {item.current_progress}/{item.target_progress}
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      +{badge.points_reward} pts
                    </p>
                  </div>
                </div>
                <Progress value={item.progress_percentage} className="h-2" />
                <div className="flex items-center justify-between">
                  {item.progress_percentage >= 75 ? (
                    <p className="text-xs text-primary font-medium">
                      🎯 Just {item.target_progress - item.current_progress} more to go!
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {item.progress_percentage.toFixed(0)}% complete
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MousePointerClick className="w-3 h-3" />
                    <span>Click to continue</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
