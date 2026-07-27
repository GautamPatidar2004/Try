import { useAmbassadorTiers } from "@/hooks/useAmbassadorTiers";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Star, Crown, Award } from "lucide-react";
import { BrandCard, StatCard } from "@/components/ui/brand-card";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { triggerTierUpConfetti } from "@/utils/lazyConfetti";

interface TierProgressTrackerProps {
  variant?: "full" | "header" | "compact";
}

export const TierProgressTracker = ({ variant = "full" }: TierProgressTrackerProps) => {
  const { tierProgress, tiers, isLoading } = useAmbassadorTiers();

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!tierProgress) {
    return null;
  }

  const { currentTier, nextTier, progressPercentage, referralsToNext, earningsToNext, totalReferrals, totalEarnings } = tierProgress;

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case "Pro Partner":
        return <Crown className="h-5 w-5" />;
      case "Elite":
        return <Star className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  if (variant === "header") {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <Badge 
          className="px-3 py-1.5 text-sm font-semibold"
          style={{ 
            backgroundColor: currentTier.color + "20",
            color: currentTier.color,
            borderColor: currentTier.color
          }}
        >
          <span className="mr-1.5">{currentTier.icon}</span>
          {currentTier.name}
        </Badge>
        {nextTier && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Progress value={progressPercentage} className="w-20 sm:w-24 h-2" />
            <span className="hidden sm:inline">{progressPercentage}% to {nextTier.name}</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AnimatedIcon animation="float" size="md" className="bg-brand-green/10">
              <span className="text-2xl">{currentTier.icon}</span>
            </AnimatedIcon>
            <span className="font-semibold">{currentTier.name}</span>
          </div>
          {currentTier.commission_bonus > 0 && (
            <Badge variant="secondary" className="bg-brand-green/10 text-brand-green">
              +{currentTier.commission_bonus}% bonus
            </Badge>
          )}
        </div>
        
        {nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to {nextTier.name}</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {referralsToNext} more referrals or ${earningsToNext.toFixed(0)} earnings to go
            </p>
          </div>
        )}

        {!nextTier && (
          <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg text-center border border-yellow-500/20">
            <Crown className="h-6 w-6 mx-auto text-yellow-600 mb-1 animate-bounce-subtle" />
            <p className="text-sm font-medium text-yellow-700">Top tier reached!</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <BrandCard variant="gradient" className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-green" />
          Tier Progress
        </h3>
        <Badge 
          className="px-3 py-1.5 text-sm font-semibold w-fit"
          style={{ 
            backgroundColor: currentTier.color + "20",
            color: currentTier.color,
            borderColor: currentTier.color
          }}
        >
          <span className="mr-1.5">{currentTier.icon}</span>
          {currentTier.name}
        </Badge>
      </div>

      {/* Tier Progression Visual - Horizontally scrollable on mobile */}
      <div className="overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-between relative min-w-[300px]">
          {tiers.map((tier, index) => (
            <div 
              key={tier.id} 
              className="flex flex-col items-center z-10"
            >
              <AnimatedIcon
                animation={tier.display_order === currentTier.display_order ? "glow" : "none"}
                size="md"
                className={`border-2 transition-all ${
                  tier.display_order <= currentTier.display_order
                    ? "shadow-md"
                    : ""
                }`}
                style={tier.display_order <= currentTier.display_order ? {
                  borderColor: tier.color,
                  backgroundColor: tier.color + "20"
                } : {
                  borderColor: 'hsl(var(--muted))',
                  backgroundColor: 'hsl(var(--muted))'
                }}
              >
                <span className="text-xl">{tier.icon}</span>
              </AnimatedIcon>
              <span className={`text-xs mt-1 font-medium text-center ${
                tier.display_order <= currentTier.display_order 
                  ? "text-foreground" 
                  : "text-muted-foreground"
              }`}>
                {tier.name}
              </span>
              {tier.commission_bonus > 0 && (
                <span className="text-xs text-brand-green">+{tier.commission_bonus}%</span>
              )}
            </div>
          ))}
          
          {/* Progress line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted -z-0">
            <div 
              className="h-full bg-brand-green transition-all"
              style={{ 
                width: `${((currentTier.display_order - 1) / (tiers.length - 1)) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Current Stats - Responsive grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
        <StatCard className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-brand-green">{totalReferrals}</div>
          <div className="text-xs text-muted-foreground">Total Referrals</div>
        </StatCard>
        <StatCard className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-brand-green">${totalEarnings.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">Lifetime Earnings</div>
        </StatCard>
      </div>

      {/* Next Tier Progress */}
      {nextTier ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to {nextTier.name}</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Need {referralsToNext} more referrals or ${earningsToNext.toFixed(0)} more in earnings
          </p>
        </div>
      ) : (
        <div className="text-center p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/20">
          <Crown className="h-8 w-8 mx-auto text-yellow-600 mb-2 animate-float" />
          <p className="font-semibold text-yellow-700">You've reached the top tier!</p>
          <p className="text-xs text-muted-foreground">Enjoy maximum commission bonuses</p>
        </div>
      )}

      {/* Current Tier Benefits - Collapsible on mobile */}
      <details className="mt-4 pt-4 border-t group" open>
        <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-medium touch-manipulation">
          Your Benefits
          <span className="transition-transform group-open:rotate-180 text-muted-foreground">▼</span>
        </summary>
        <ul className="text-xs text-muted-foreground space-y-1 mt-2 animate-fade-in">
          {currentTier.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="text-brand-green">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </details>
    </BrandCard>
  );
};
