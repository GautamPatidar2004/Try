import { useAmbassadorStreaks } from "@/hooks/useAmbassadorStreaks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Calendar, TrendingUp, Zap } from "lucide-react";

interface StreakTrackerProps {
  variant?: "full" | "compact";
}

export const StreakTracker = ({ variant = "full" }: StreakTrackerProps) => {
  const { postingStreak, referralStreak, weeklyStreak, isLoading, getStreakIcon } = useAmbassadorStreaks();

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  const streaks = [
    {
      type: "posting",
      label: "Posting Streak",
      icon: <Flame className="h-5 w-5" />,
      current: postingStreak?.current_streak || 0,
      longest: postingStreak?.longest_streak || 0,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      description: "Days of consecutive posting",
      bonus: postingStreak && postingStreak.current_streak >= 7 ? "+5% bonus" : null,
    },
    {
      type: "referral",
      label: "Referral Streak",
      icon: <TrendingUp className="h-5 w-5" />,
      current: referralStreak?.current_streak || 0,
      longest: referralStreak?.longest_streak || 0,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Weeks with signups",
      bonus: referralStreak && referralStreak.current_streak >= 4 ? "Weekly Warrior badge" : null,
    },
    {
      type: "weekly",
      label: "Activity Streak",
      icon: <Calendar className="h-5 w-5" />,
      current: weeklyStreak?.current_streak || 0,
      longest: weeklyStreak?.longest_streak || 0,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Weeks active",
      bonus: null,
    },
  ];

  if (variant === "compact") {
    return (
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Streaks
        </h4>
        <div className="flex gap-4">
          {streaks.slice(0, 2).map((streak) => (
            <div key={streak.type} className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${streak.bgColor}`}>
                <span className={streak.color}>{streak.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold">{streak.current}</span>
                  <span className="text-xs">{getStreakIcon(streak.current)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{streak.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Your Streaks
        </h3>
        {streaks.some(s => s.current >= 7) && (
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-700">
            🔥 On Fire!
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {streaks.map((streak) => (
          <div
            key={streak.type}
            className={`relative p-4 rounded-lg border ${streak.bgColor} transition-all hover:scale-[1.02]`}
          >
            {/* Streak Fire Animation for high streaks */}
            {streak.current >= 7 && (
              <div className="absolute -top-2 -right-2 animate-bounce">
                <span className="text-xl">🔥</span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full ${streak.bgColor} ${streak.color}`}>
                {streak.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{streak.label}</p>
                <p className="text-xs text-muted-foreground">{streak.description}</p>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{streak.current}</span>
                  <span className="text-lg">{getStreakIcon(streak.current)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Best: {streak.longest}
                </p>
              </div>

              {streak.bonus && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-600/30">
                  {streak.bonus}
                </Badge>
              )}
            </div>

            {/* Progress to next milestone */}
            {streak.current > 0 && streak.current < 7 && (
              <div className="mt-3 pt-3 border-t border-muted">
                <p className="text-xs text-muted-foreground">
                  {7 - streak.current} more days to unlock streak bonus!
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Motivational message */}
      <div className="mt-4 p-3 bg-primary/5 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          {postingStreak && postingStreak.current_streak > 0 ? (
            <>Keep it going! You're on a {postingStreak.current_streak}-day streak! 💪</>
          ) : (
            <>Start your streak today by posting content! 🚀</>
          )}
        </p>
      </div>
    </Card>
  );
};
