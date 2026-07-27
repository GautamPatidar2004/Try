import { useState, useEffect } from "react";
import { useAmbassadorTiers } from "@/hooks/useAmbassadorTiers";
import { useAmbassadorBadges } from "@/hooks/useAmbassadorBadges";
import { useAmbassadorStreaks } from "@/hooks/useAmbassadorStreaks";
import { useAmbassador } from "@/hooks/useAmbassador";
import { Button } from "@/components/ui/button";
import { X, Rocket, Target, Trophy, Flame, ArrowRight } from "lucide-react";

interface AchievementBannerProps {
  onDismiss?: () => void;
}

interface AchievementGoal {
  id: string;
  icon: React.ReactNode;
  message: string;
  progress?: number;
  target?: number;
  actionLabel?: string;
  priority: number;
}

export const AchievementBanner = ({ onDismiss }: AchievementBannerProps) => {
  const { ambassador } = useAmbassador();
  const { tierProgress } = useAmbassadorTiers();
  const { availableBadges } = useAmbassadorBadges(ambassador?.user_id);
  const { postingStreak } = useAmbassadorStreaks();
  
  const [dismissed, setDismissed] = useState(false);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

  // Generate achievement goals
  const goals: AchievementGoal[] = [];

  // Tier progress goal
  if (tierProgress?.nextTier) {
    const { referralsToNext, earningsToNext, nextTier } = tierProgress;
    if (referralsToNext <= 5 || earningsToNext <= 100) {
      goals.push({
        id: "tier-progress",
        icon: <Trophy className="h-5 w-5" />,
        message: referralsToNext <= earningsToNext / 50 
          ? `You're ${referralsToNext} referral${referralsToNext === 1 ? "" : "s"} away from ${nextTier.name} tier! 🚀`
          : `$${earningsToNext.toFixed(0)} more in earnings to reach ${nextTier.name} tier! 💰`,
        progress: tierProgress.progressPercentage,
        target: 100,
        priority: 1,
      });
    }
  }

  // Badge progress goals
  const closestBadge = availableBadges
    .filter(b => b.progressPercentage >= 50)
    .sort((a, b) => b.progressPercentage - a.progressPercentage)[0];

  if (closestBadge) {
    const remaining = closestBadge.criteria.target - closestBadge.progress;
    goals.push({
      id: `badge-${closestBadge.id}`,
      icon: <Target className="h-5 w-5" />,
      message: `${remaining} more to unlock "${closestBadge.name}" badge! ${closestBadge.icon}`,
      progress: closestBadge.progressPercentage,
      target: 100,
      priority: 2,
    });
  }

  // Streak goals
  if (postingStreak) {
    if (postingStreak.current_streak > 0 && postingStreak.current_streak < 7) {
      const daysToBonus = 7 - postingStreak.current_streak;
      goals.push({
        id: "streak-posting",
        icon: <Flame className="h-5 w-5" />,
        message: `${daysToBonus} more day${daysToBonus === 1 ? "" : "s"} to unlock your streak bonus! 🔥`,
        progress: postingStreak.current_streak,
        target: 7,
        priority: 3,
      });
    }
  } else {
    goals.push({
      id: "start-streak",
      icon: <Flame className="h-5 w-5" />,
      message: "Start your posting streak today to earn bonus rewards! 🚀",
      priority: 4,
    });
  }

  // Generic motivation if no specific goals
  if (goals.length === 0) {
    goals.push({
      id: "keep-going",
      icon: <Rocket className="h-5 w-5" />,
      message: "You're doing great! Keep up the momentum! 💪",
      priority: 10,
    });
  }

  // Sort by priority and rotate through goals
  const sortedGoals = goals.sort((a, b) => a.priority - b.priority);
  const currentGoal = sortedGoals[currentGoalIndex % sortedGoals.length];

  useEffect(() => {
    if (sortedGoals.length > 1) {
      const interval = setInterval(() => {
        setCurrentGoalIndex((prev) => (prev + 1) % sortedGoals.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [sortedGoals.length]);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      
      <div className="relative p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 p-1.5 sm:p-2 rounded-full bg-primary/20 text-primary">
            {currentGoal.icon}
          </div>
          
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="font-medium text-xs sm:text-sm md:text-base line-clamp-2 sm:truncate">
              {currentGoal.message}
            </p>
            
            {currentGoal.progress !== undefined && currentGoal.target !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-24 sm:max-w-32">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(currentGoal.progress / currentGoal.target) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                  {currentGoal.progress}/{currentGoal.target}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {sortedGoals.length > 1 && (
            <div className="hidden md:flex items-center gap-1">
              {sortedGoals.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentGoalIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentGoalIndex % sortedGoals.length
                      ? "bg-primary w-3"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Next goal preview on hover */}
      {sortedGoals.length > 1 && (
        <button
          onClick={() => setCurrentGoalIndex((prev) => (prev + 1) % sortedGoals.length)}
          className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full bg-muted/50 opacity-0 hover:opacity-100 transition-opacity"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
