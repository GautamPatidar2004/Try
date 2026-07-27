import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, ChevronRight } from "lucide-react";
import { useAmbassadorEarnings } from "@/hooks/useAmbassadorEarnings";
import { useAmbassadorTiers } from "@/hooks/useAmbassadorTiers";
import { useAmbassador } from "@/hooks/useAmbassador";
import { RevenueSimulatorSheet } from "./RevenueSimulatorSheet";
import { BrandCard, StatCard } from "@/components/ui/brand-card";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { RequestPayoutDialog } from "./RequestPayoutDialog";

export const EarningsOverview = () => {
  const [showSimulator, setShowSimulator] = useState(false);
  const { calculation, isRealTimeConnected } = useAmbassadorEarnings();
  const { tierProgress } = useAmbassadorTiers();
  const { ambassador } = useAmbassador();

  const tierBonus = tierProgress?.currentTier?.commission_bonus || 0;
  const meetsRequirements = ambassador?.monthly_requirements_met || false;
  const requirementsBonus = meetsRequirements ? 5 : 0;
  const totalBonus = tierBonus + requirementsBonus;

  // Calculate with bonuses
  const tierBonusAmount = calculation.projectedMonthly * (tierBonus / 100);
  const requirementsBonusAmount = meetsRequirements 
    ? (calculation.projectedMonthly + tierBonusAmount) * 0.05 
    : 0;
  const totalWithBonuses = calculation.projectedMonthly + tierBonusAmount + requirementsBonusAmount;

  return (
    <>
      <BrandCard variant="gradient" className="p-3 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Header with real-time indicator */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <AnimatedIcon 
                animation="glow" 
                size="md" 
                className="bg-brand-green/20 border-2 border-brand-green/30 shrink-0"
              >
                <DollarSign className="h-5 w-5 sm:h-7 sm:w-7 text-brand-green" />
              </AnimatedIcon>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Monthly Earnings</p>
                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-2xl sm:text-4xl font-bold text-brand-green">${totalWithBonuses.toFixed(0)}</span>
                  {totalBonus > 0 && (
                    <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30 text-[10px] sm:text-xs">
                      +{totalBonus}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {isRealTimeConnected && (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-green-600 shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="hidden sm:inline">Live</span>
              </div>
            )}
          </div>

          {/* Secondary Stats - Responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard className="text-center">
              <p className="text-lg sm:text-xl font-semibold">${calculation.lifetimeTotal.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Lifetime</p>
            </StatCard>
            <StatCard className="text-center">
              <p className="text-lg sm:text-xl font-semibold">${calculation.pendingPayouts.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </StatCard>
            
            {/* Desktop simulate button in grid */}
            <div className="hidden sm:block">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSimulator(true)}
                className="w-full h-full min-h-[60px] border-brand-green/30 hover:bg-brand-green/10 hover:border-brand-green/50 transition-all"
              >
                <TrendingUp className="h-4 w-4 mr-2 text-brand-green" />
                Simulate
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Mobile Simulator Button */}
          <div className="flex flex-col sm:flex-row gap-2 sm:hidden">
            <RequestPayoutDialog />
            <Button 
              variant="outline" 
              className="w-full min-h-[44px] border-brand-green/30 hover:bg-brand-green/10 touch-manipulation"
              onClick={() => setShowSimulator(true)}
            >
              <TrendingUp className="h-4 w-4 mr-2 text-brand-green" />
              See Earning Potential
            </Button>
          </div>
          
          {/* Desktop Request Payout */}
          <div className="hidden sm:flex justify-end">
            <RequestPayoutDialog />
          </div>
        </div>
      </BrandCard>

      <RevenueSimulatorSheet 
        open={showSimulator} 
        onOpenChange={setShowSimulator} 
      />
    </>
  );
};
