import React, { useMemo } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from './UpgradePrompt';

export type GatedFeature =
  | 'mediaKit'
  | 'advancedAnalytics'
  | 'verifiedBadge'
  | 'unlimitedPitches'
  | 'profileBoosts'
  | 'prioritySearch'
  | 'unlimitedBrowsing';

interface FeatureGateProps {
  feature: GatedFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate = ({ feature, children, fallback }: FeatureGateProps) => {
  const { subscriptionStatus } = useSubscription();
  
  const hasAccess = useMemo(() => {
    if (!subscriptionStatus?.plan) return false;
    
    switch (feature) {
      case 'mediaKit': 
        return subscriptionStatus.plan.hasMediaKit;
      case 'advancedAnalytics': 
        return subscriptionStatus.plan.hasAdvancedAnalytics;
      case 'verifiedBadge': 
        return subscriptionStatus.plan.hasVerifiedBadge;
      case 'unlimitedPitches': 
        return subscriptionStatus.plan.maxPitchesPerMonth === -1 || subscriptionStatus.plan.maxPitchesPerMonth === null;
      case 'profileBoosts':
        return (subscriptionStatus.plan.marketplaceBoostsPerMonth ?? 0) > 0;
      case 'prioritySearch':
        return (subscriptionStatus.plan.searchPriority ?? 1) > 1;
      case 'unlimitedBrowsing':
        // Any paid plan grants unlimited browsing
        return subscriptionStatus.plan.name !== 'Creator Starter';
      default:
        return false;
    }
  }, [subscriptionStatus, feature]);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : <UpgradePrompt feature={feature} />;
};
