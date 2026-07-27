import { useMemo } from "react";
import { useAmbassadorTiers } from "./useAmbassadorTiers";
import { useAmbassadorEarnings } from "./useAmbassadorEarnings";
import { useAmbassador } from "./useAmbassador";

export interface RevenueProjection {
  creatorReferrals: number;
  propertyMatches: number;
  restaurantMatches: number;
  brandDeals: number;
  monthlyRecurring: number;
  oneTimeEarnings: number;
  totalMonthly: number;
  tierBonus: number;
  requirementsBonus: number;
  grandTotal: number;
}

export interface ProjectionScenario {
  name: string;
  creatorReferrals: number;
  propertyMatches: number;
  restaurantMatches: number;
  brandDeals: number;
}

// Commission rates
const RATES = {
  creatorCommission: 0.20, // 20% of subscription
  avgSubscriptionValue: 15, // Average subscription $15/month
  propertyMatchFee: 500,
  restaurantMatchFee: 100,
  brandDealFee: 250,
  requirementsBonus: 0.05, // 5% bonus for meeting requirements
};

export const useRevenueProjections = () => {
  const { tierProgress } = useAmbassadorTiers();
  const { calculation, referrals } = useAmbassadorEarnings();
  const { ambassador } = useAmbassador();

  const tierBonus = tierProgress?.currentTier?.commission_bonus || 0;
  const meetsRequirements = ambassador?.monthly_requirements_met || false;

  const calculateProjection = (
    creatorReferrals: number,
    propertyMatches: number,
    restaurantMatches: number,
    brandDeals: number
  ): RevenueProjection => {
    // Monthly recurring from creator subscriptions
    const baseMonthlyRecurring = creatorReferrals * RATES.avgSubscriptionValue * RATES.creatorCommission;
    
    // One-time earnings from matches
    const oneTimeEarnings = 
      (propertyMatches * RATES.propertyMatchFee) +
      (restaurantMatches * RATES.restaurantMatchFee) +
      (brandDeals * RATES.brandDealFee);
    
    const totalMonthly = baseMonthlyRecurring + oneTimeEarnings;
    
    // Apply tier bonus
    const tierBonusAmount = totalMonthly * (tierBonus / 100);
    
    // Apply requirements bonus
    const requirementsBonusAmount = meetsRequirements 
      ? (totalMonthly + tierBonusAmount) * RATES.requirementsBonus 
      : 0;
    
    const grandTotal = totalMonthly + tierBonusAmount + requirementsBonusAmount;

    return {
      creatorReferrals,
      propertyMatches,
      restaurantMatches,
      brandDeals,
      monthlyRecurring: baseMonthlyRecurring,
      oneTimeEarnings,
      totalMonthly,
      tierBonus: tierBonusAmount,
      requirementsBonus: requirementsBonusAmount,
      grandTotal,
    };
  };

  // Pre-defined scenarios
  const scenarios: ProjectionScenario[] = useMemo(() => [
    { name: "Conservative", creatorReferrals: 5, propertyMatches: 1, restaurantMatches: 2, brandDeals: 0 },
    { name: "Moderate", creatorReferrals: 15, propertyMatches: 2, restaurantMatches: 5, brandDeals: 1 },
    { name: "Ambitious", creatorReferrals: 30, propertyMatches: 4, restaurantMatches: 10, brandDeals: 3 },
    { name: "Pro Partner", creatorReferrals: 50, propertyMatches: 8, restaurantMatches: 15, brandDeals: 5 },
  ], []);

  // Current performance analysis
  const currentPerformance = useMemo(() => {
    const activeReferrals = referrals.filter(r => r.status === "active").length;
    return {
      activeReferrals,
      monthlyRecurring: calculation.monthlyRecurring,
      lifetimeEarnings: calculation.lifetimeTotal,
      pendingPayouts: calculation.pendingPayouts,
    };
  }, [referrals, calculation]);

  // Weekly growth projections (simple linear projection)
  const weeklyProjections = useMemo(() => {
    const baseWeeklyEarning = calculation.projectedMonthly / 4;
    const growthRate = 1.05; // 5% weekly growth assumption

    return Array.from({ length: 8 }, (_, week) => ({
      week: week + 1,
      projected: baseWeeklyEarning * Math.pow(growthRate, week),
      cumulative: Array.from({ length: week + 1 }, (_, i) => 
        baseWeeklyEarning * Math.pow(growthRate, i)
      ).reduce((a, b) => a + b, 0),
    }));
  }, [calculation.projectedMonthly]);

  return {
    calculateProjection,
    scenarios,
    currentPerformance,
    weeklyProjections,
    tierBonus,
    meetsRequirements,
    rates: RATES,
  };
};
