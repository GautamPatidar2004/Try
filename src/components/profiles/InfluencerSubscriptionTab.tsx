import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Calendar, 
  Target,
  Settings,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  ExternalLink,
  BadgeCheck,
  Sparkles,
  Rocket,
  FileText
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

export const InfluencerSubscriptionTab: React.FC = () => {
  const { 
    subscriptionStatus, 
    loading, 
    manageSubscription,
    getRemainingApplications,
    getRemainingBoostsThisMonth,
    activateProfileBoost,
  } = useSubscription();
  
  const [remainingPitches, setRemainingPitches] = React.useState<number>(0);
  const [boostInfo, setBoostInfo] = React.useState<{ limit: number; used: number; remaining: number }>({ limit: 0, used: 0, remaining: 0 });
  const [boosting, setBoosting] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchRemainingPitches = async () => {
      const remaining = await getRemainingApplications();
      setRemainingPitches(remaining || 0);
    };
    
    if (subscriptionStatus?.hasActiveSubscription) {
      fetchRemainingPitches();
    }
  }, [subscriptionStatus, getRemainingApplications]);

  React.useEffect(() => {
    if ((subscriptionStatus?.plan?.marketplaceBoostsPerMonth ?? 0) > 0) {
      getRemainingBoostsThisMonth().then(setBoostInfo);
    }
  }, [subscriptionStatus, getRemainingBoostsThisMonth]);

  const handleBoost = async () => {
    setBoosting(true);
    const ok = await activateProfileBoost();
    if (ok) {
      const info = await getRemainingBoostsThisMonth();
      setBoostInfo(info);
    }
    setBoosting(false);
  };

  const handleManageSubscription = async () => {
    try {
      await manageSubscription();
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionStatus?.hasActiveSubscription) {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800 dark:text-yellow-200">No Active Subscription</CardTitle>
            </div>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Subscribe to unlock more pitches and premium features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>What you'll get with Pro:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Unlimited pitches to properties</li>
                  <li>Verified creator badge</li>
                  <li>Professional media kit</li>
                  <li>Priority in search results</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/pricing')} className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Plans
                </Button>
                <Button variant="outline" onClick={() => navigate('/subscription')}>
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlan = subscriptionStatus?.plan;
  const planName = currentPlan?.name || 'Free';
  const billingPeriod = subscriptionStatus?.billingInterval || 'monthly';
  const nextBillingDate = subscriptionStatus?.currentPeriodEnd 
    ? new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()
    : 'N/A';

  // Get max pitches from plan
  const maxPitches = currentPlan?.maxPitchesPerMonth || currentPlan?.maxApplicationsPerMonth || 10;
  const usagePercentage = maxPitches > 0 ? ((maxPitches - remainingPitches) / maxPitches) * 100 : 0;

  // Get creator-specific features
  const hasVerifiedBadge = currentPlan?.hasVerifiedBadge || false;
  const hasMediaKit = currentPlan?.hasMediaKit || false;
  const searchPriority = currentPlan?.searchPriority || 1;
  const boostsPerMonth = currentPlan?.marketplaceBoostsPerMonth || 0;
  const hasAdvancedAnalytics = currentPlan?.hasAdvancedAnalytics || false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Creator Subscription</h2>
          <p className="text-muted-foreground mt-2">
            Manage your subscription plan and billing
          </p>
        </div>
        <Button onClick={handleManageSubscription}>
          <Settings className="w-4 h-4 mr-2" />
          Manage
        </Button>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{planName}</CardTitle>
              <CardDescription>
                Billed {billingPeriod}
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Next Billing Date</span>
                </div>
                <p className="text-xl font-semibold">{nextBillingDate}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Plan Type</span>
                </div>
                <p className="text-xl font-semibold capitalize">{billingPeriod}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xl font-semibold">Active</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pitch Usage Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Pitch Usage</CardTitle>
              <CardDescription>
                Track your pitch submissions this month
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg">
              {maxPitches === -1 ? '∞' : remainingPitches} / {maxPitches === -1 ? '∞' : maxPitches}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {maxPitches === -1 ? (
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Unlimited pitches with your plan!</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Progress value={usagePercentage} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{maxPitches - remainingPitches} pitches used</span>
                <span>{remainingPitches} remaining</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Creator Features */}
      <Card>
        <CardHeader>
          <CardTitle>Your Creator Features</CardTitle>
          <CardDescription>Premium features included in your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {hasVerifiedBadge && (
              <li className="flex items-start gap-3">
                <BadgeCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Verified Creator Badge</p>
                  <p className="text-sm text-muted-foreground">
                    Stand out with a verified badge on your profile
                  </p>
                </div>
              </li>
            )}
            
            {hasMediaKit && (
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Professional Media Kit</p>
                  <p className="text-sm text-muted-foreground">
                    Showcase your work with a professional media kit
                  </p>
                </div>
              </li>
            )}
            
            {searchPriority > 1 && (
              <li className="flex items-start gap-3">
                <Rocket className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Priority Search Ranking ({searchPriority}x)</p>
                  <p className="text-sm text-muted-foreground">
                    Appear higher in search results for hosts and brands
                  </p>
                </div>
              </li>
            )}
            
            {boostsPerMonth > 0 && (
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{boostsPerMonth} Profile Boosts/Month</p>
                  <p className="text-sm text-muted-foreground">
                    Boost your profile visibility in the marketplace ({boostInfo.remaining} of {boostInfo.limit} remaining this month)
                  </p>
                </div>
                <Button size="sm" onClick={handleBoost} disabled={boosting || boostInfo.remaining <= 0}>
                  {boosting ? 'Boosting…' : 'Boost Now'}
                </Button>
              </li>
            )}
            
            {hasAdvancedAnalytics && (
              <li className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Advanced Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Track your performance with detailed analytics
                  </p>
                </div>
              </li>
            )}
            
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Unlimited Property Browsing</p>
                <p className="text-sm text-muted-foreground">
                  Access the full marketplace of properties
                </p>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{maxPitches === -1 ? 'Unlimited' : maxPitches} Monthly Pitches</p>
                <p className="text-sm text-muted-foreground">
                  Pitch to {maxPitches === -1 ? 'unlimited' : maxPitches} properties per month
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your account and explore more</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={() => navigate('/marketplace')}
            >
              <Target className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Browse Properties</div>
                <div className="text-xs text-muted-foreground">Discover collaboration opportunities</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={() => navigate('/pricing')}
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Upgrade Plan</div>
                <div className="text-xs text-muted-foreground">Get more pitches and features</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
