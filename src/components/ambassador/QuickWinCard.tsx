import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Lightbulb, ChevronRight, TrendingUp, Calendar, Users, Target } from "lucide-react";
import { useAmbassadorEarnings } from "@/hooks/useAmbassadorEarnings";
import { useAmbassadorStreaks } from "@/hooks/useAmbassadorStreaks";
import { useAmbassadorTiers } from "@/hooks/useAmbassadorTiers";
import { useAmbassador } from "@/hooks/useAmbassador";

interface Tip {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  impact: string;
  priority: "high" | "medium" | "low";
}

export const QuickWinCard = () => {
  const [showAllTips, setShowAllTips] = useState(false);
  const { calculation, referrals } = useAmbassadorEarnings();
  const { postingStreak } = useAmbassadorStreaks();
  const { tierProgress } = useAmbassadorTiers();
  const { ambassador } = useAmbassador();

  const tips = useMemo(() => {
    const recommendations: Tip[] = [];

    // Check posting streak
    if (!postingStreak || postingStreak.current_streak < 3) {
      recommendations.push({
        id: "streak",
        icon: <Calendar className="h-4 w-4" />,
        title: "Start a posting streak",
        description: "Post consistently to unlock streak bonuses and boost visibility",
        impact: "+5% earnings bonus at 7-day streak",
        priority: "high",
      });
    }

    // Check monthly requirements
    if (!ambassador?.monthly_requirements_met) {
      recommendations.push({
        id: "requirements",
        icon: <Target className="h-4 w-4" />,
        title: "Complete monthly requirements",
        description: "Post 4 IG stories + 1 feed post to unlock your bonus",
        impact: "+5% on all earnings",
        priority: "high",
      });
    }

    // Check tier progress
    if (tierProgress?.nextTier && tierProgress.progressPercentage > 50) {
      recommendations.push({
        id: "tier",
        icon: <TrendingUp className="h-4 w-4" />,
        title: `Almost at ${tierProgress.nextTier.name}!`,
        description: `You're ${tierProgress.progressPercentage}% of the way there`,
        impact: `+${tierProgress.nextTier.commission_bonus}% commission bonus`,
        priority: "high",
      });
    }

    // Referral suggestions
    if (!referrals || referrals.length < 3) {
      recommendations.push({
        id: "referrals",
        icon: <Users className="h-4 w-4" />,
        title: "Grow your referral base",
        description: "Each creator referral earns you 20% of their subscription",
        impact: "~$12/month per active referral",
        priority: "medium",
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [postingStreak, ambassador, tierProgress, referrals]);

  const topTip = tips[0];

  if (!topTip) {
    return (
      <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-500/20">
            <Lightbulb className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-700">You're doing great!</p>
            <p className="text-sm text-muted-foreground">Keep up the momentum</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-3 sm:p-4 overflow-hidden">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-full bg-primary/10 shrink-0">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base truncate">{topTip.title}</p>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{topTip.description}</p>
              <p className="text-xs text-green-600 mt-1">{topTip.impact}</p>
            </div>
          </div>
          {tips.length > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAllTips(true)}
              className="shrink-0 px-2 sm:px-3 min-h-[36px]"
            >
              <span className="hidden sm:inline">All tips</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          )}
        </div>
      </Card>

      <Sheet open={showAllTips} onOpenChange={setShowAllTips}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Tips to Boost Earnings
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4">
            {tips.map((tip) => (
              <div key={tip.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-primary/10 shrink-0">
                  {tip.icon}
                </div>
                <div>
                  <p className="font-medium">{tip.title}</p>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                  <p className="text-xs text-green-600 mt-1">{tip.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
