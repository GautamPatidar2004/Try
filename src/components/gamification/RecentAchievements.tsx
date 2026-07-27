import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAchievements } from '@/hooks/useAchievements';
import { useBadges } from '@/hooks/useBadges';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Sparkles, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { executeBadgeAction } from '@/lib/badgeActionRouter';
import { Button } from '@/components/ui/button';

interface RecentAchievementsProps {
  userId: string;
}

export const RecentAchievements: React.FC<RecentAchievementsProps> = ({ userId }) => {
  const { recentAchievements, loading: achievementsLoading } = useAchievements(userId);
  const { earnedBadges, loading: badgesLoading } = useBadges(userId);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loading = achievementsLoading || badgesLoading;

  const handleAchievementClick = (badgeName: string) => {
    // Always treat these as earned since they're in recent achievements
    executeBadgeAction(badgeName, navigate, toast, true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentBadges = earnedBadges.slice(0, 5);

  if (recentBadges.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-5 h-5 text-primary" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentBadges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => handleAchievementClick(badge.name)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 transition-colors cursor-pointer hover:bg-secondary/50 active:scale-[0.98]"
            >
              <div className="text-3xl">{badge.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{badge.name}</p>
                <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
                {badge.earned_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(badge.earned_at), { addSuffix: true })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">
                  +{(badge as any).points_reward || 0}
                </span>
              </div>
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          className="w-full mt-4 text-sm"
          onClick={() => navigate('/profile?tab=badges')}
        >
          View all badges
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
