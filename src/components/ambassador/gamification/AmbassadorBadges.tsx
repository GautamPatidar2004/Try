import { useState, useEffect } from "react";
import { useAmbassadorBadges } from "@/hooks/useAmbassadorBadges";
import { useAmbassador } from "@/hooks/useAmbassador";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, Lock, Sparkles } from "lucide-react";
import { triggerBadgeConfetti } from "@/utils/lazyConfetti";
import { BrandCard } from "@/components/ui/brand-card";
import { AnimatedIcon } from "@/components/ui/animated-icon";

interface AmbassadorBadgesProps {
  variant?: "full" | "compact" | "mini";
}

export const AmbassadorBadges = ({ variant = "full" }: AmbassadorBadgesProps) => {
  const { ambassador } = useAmbassador();
  const { badges, earnedBadges, isLoading, completionPercentage } = useAmbassadorBadges(ambassador?.user_id);
  const [selectedBadge, setSelectedBadge] = useState<typeof badges[0] | null>(null);
  const [celebratingBadge, setCelebratingBadge] = useState<string | null>(null);

  // Track previously earned badges to detect new ones
  const [prevEarnedCount, setPrevEarnedCount] = useState(0);

  useEffect(() => {
    if (earnedBadges.length > prevEarnedCount && prevEarnedCount > 0) {
      // New badge earned - trigger celebration with brand colors
      const newBadge = earnedBadges[earnedBadges.length - 1];
      setCelebratingBadge(newBadge.id);
      
      triggerBadgeConfetti();

      setTimeout(() => setCelebratingBadge(null), 3000);
    }
    setPrevEarnedCount(earnedBadges.length);
  }, [earnedBadges.length]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "gold":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500";
      case "silver":
        return "bg-gray-300/30 text-foreground/80 border-gray-400";
      default:
        return "bg-orange-500/20 text-orange-700 border-orange-500";
    }
  };

  if (variant === "mini") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {earnedBadges.slice(0, 3).map((badge) => (
            <div
              key={badge.id}
              className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-sm"
              title={badge.name}
            >
              {badge.icon}
            </div>
          ))}
        </div>
        {earnedBadges.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{earnedBadges.length - 3} more
          </span>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AnimatedIcon animation="pulse" size="sm" className="bg-brand-green/10">
              <Award className="h-4 w-4 text-brand-green" />
            </AnimatedIcon>
            <span className="font-medium">Your Badges</span>
          </div>
          <span className="text-sm text-muted-foreground">{earnedBadges.length}/{badges.length} earned</span>
        </div>
        
        {/* Responsive grid - 4 cols on mobile, 6 on tablet+ */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
          {badges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`relative min-h-[44px] min-w-[44px] p-2 sm:p-3 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all hover:scale-110 touch-manipulation ${
                badge.earned
                  ? "bg-brand-green/10 border-2 border-brand-green shadow-sm"
                  : "bg-muted border-2 border-muted-foreground/20 opacity-50"
              } ${celebratingBadge === badge.id ? "animate-bounce-subtle ring-2 ring-brand-blush" : ""}`}
            >
              {badge.earned ? badge.icon : <Lock className="h-4 w-4 text-muted-foreground" />}
            </button>
          ))}
        </div>

        <BadgeDetailDialog 
          badge={selectedBadge} 
          onClose={() => setSelectedBadge(null)} 
          getTierColor={getTierColor}
        />
      </div>
    );
  }

  return (
    <BrandCard variant="glow" className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AnimatedIcon animation="float" size="sm" className="bg-brand-green/10">
            <Award className="h-5 w-5 text-brand-green" />
          </AnimatedIcon>
          Ambassador Badges
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{completionPercentage}% Complete</span>
          <Badge variant="secondary" className="bg-brand-blush text-brand-dark">{earnedBadges.length}/{badges.length}</Badge>
        </div>
      </div>

      <Progress value={completionPercentage} className="h-2 mb-6" />

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            Earned ({earnedBadges.length})
          </h4>
          {/* Responsive grid - 2 cols mobile, 3 tablet, 4 desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {earnedBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`relative p-3 sm:p-4 rounded-xl bg-gradient-to-br from-brand-green/5 to-brand-blush/20 border border-brand-green/20 hover:border-brand-green/40 transition-all hover:scale-105 touch-manipulation min-h-[80px] ${
                  celebratingBadge === badge.id ? "animate-glow-pulse ring-2 ring-yellow-500" : ""
                }`}
              >
                <div className="text-2xl sm:text-3xl mb-1 text-center">{badge.icon}</div>
                <p className="text-xs font-medium text-center truncate">{badge.name}</p>
                <Badge 
                  variant="outline" 
                  className={`mt-1 text-[10px] ${getTierColor(badge.tier)}`}
                >
                  {badge.tier}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          In Progress ({badges.filter(b => !b.earned).length})
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {badges.filter(b => !b.earned).map((badge) => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className="relative p-3 sm:p-4 rounded-xl bg-muted/50 border border-muted hover:border-muted-foreground/30 transition-all opacity-70 hover:opacity-100 touch-manipulation min-h-[80px] shimmer"
            >
              <div className="text-2xl sm:text-3xl mb-1 text-center grayscale">{badge.icon}</div>
              <p className="text-xs font-medium text-center truncate text-muted-foreground">
                {badge.name}
              </p>
              <div className="mt-2">
                <Progress value={badge.progressPercentage} className="h-1" />
                <p className="text-[10px] text-muted-foreground text-center mt-1">
                  {badge.progressPercentage}%
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <BadgeDetailDialog 
        badge={selectedBadge} 
        onClose={() => setSelectedBadge(null)} 
        getTierColor={getTierColor}
      />
    </BrandCard>
  );
};

interface BadgeDetailDialogProps {
  badge: ReturnType<typeof useAmbassadorBadges>["badges"][0] | null;
  onClose: () => void;
  getTierColor: (tier: string) => string;
}

const BadgeDetailDialog = ({ badge, onClose, getTierColor }: BadgeDetailDialogProps) => {
  if (!badge) return null;

  return (
    <Dialog open={!!badge} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-4xl">{badge.icon}</span>
            {badge.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">{badge.description}</p>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getTierColor(badge.tier)}>
              {badge.tier} tier
            </Badge>
            <Badge variant="secondary">+{badge.points_reward} points</Badge>
          </div>

          {badge.earned ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <Sparkles className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="font-semibold text-green-700">Badge Earned!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{badge.progress}/{badge.criteria.target}</span>
              </div>
              <Progress value={badge.progressPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {badge.criteria.target - badge.progress} more to unlock
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
