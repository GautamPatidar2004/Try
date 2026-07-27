import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Lock, TrendingUp, FileText, BadgeCheck, Rocket, Search, Compass } from 'lucide-react';
import type { GatedFeature } from './FeatureGate';

interface UpgradePromptProps {
  feature: GatedFeature;
  compact?: boolean;
}

const featureConfig: Record<GatedFeature, { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  requiredPlan: string;
}> = {
  mediaKit: {
    title: 'Professional Media Kit',
    description: 'Generate beautiful, shareable media kits to impress brands and secure more collaborations.',
    icon: <FileText className="h-6 w-6 text-primary" />,
    requiredPlan: 'Creator Pro'
  },
  advancedAnalytics: {
    title: 'Advanced Analytics',
    description: 'Unlock growth insights, monetization tracking, AI recommendations, and content intelligence.',
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
    requiredPlan: 'Creator Pro'
  },
  verifiedBadge: {
    title: 'Verified Creator Badge',
    description: 'Stand out with a verified badge that builds trust and credibility with hosts and brands.',
    icon: <BadgeCheck className="h-6 w-6 text-primary" />,
    requiredPlan: 'Creator Pro'
  },
  unlimitedPitches: {
    title: 'Unlimited Applications',
    description: 'Remove the monthly limit and apply to as many properties and campaigns as you want.',
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    requiredPlan: 'Creator Pro'
  },
  profileBoosts: {
    title: 'Profile Boosts',
    description: 'Boost your profile to the top of host and brand searches up to 10 times per month.',
    icon: <Rocket className="h-6 w-6 text-primary" />,
    requiredPlan: 'Creator Pro'
  },
  prioritySearch: {
    title: 'Priority Search Ranking',
    description: 'Appear 10x higher in search results so hosts and brands find you first.',
    icon: <Search className="h-6 w-6 text-primary" />,
    requiredPlan: 'Creator Pro'
  },
  unlimitedBrowsing: {
    title: 'Unlimited Property Browsing',
    description: 'Access the full marketplace of properties and brand campaigns without limits.',
    icon: <Compass className="h-6 w-6 text-primary" />,
    requiredPlan: 'Creator Pro'
  }
};

export const UpgradePrompt = ({ feature, compact = false }: UpgradePromptProps) => {
  const navigate = useNavigate();
  const config = featureConfig[feature];

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <Lock className="h-4 w-4 text-primary" />
        <span className="text-sm text-muted-foreground">
          Upgrade to {config.requiredPlan} to unlock
        </span>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => navigate('/subscription')}
          className="ml-auto"
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
          {config.icon}
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          {config.title}
        </CardTitle>
        <CardDescription className="text-base">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Available with <span className="font-semibold text-primary">{config.requiredPlan}</span> and above
        </p>
        <Button 
          onClick={() => navigate('/subscription')}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  );
};
