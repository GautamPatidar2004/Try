import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Target,
  Settings,
  CheckCircle,
  Share2,
  AlertTriangle,
  BadgeCheck,
  Rocket,
  Sparkles,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { ReferralDashboard } from '@/components/referrals/ReferralDashboard';

export const SubscriptionDashboard: React.FC = () => {
  const { 
    subscriptionStatus, 
    loading,
    actionLoading,
    manageSubscription,
    userType,
    userTypeCategory,
    getRemainingApplications,
    checkSubscriptionStatus,
  } = useSubscription();

  const [remainingUsage, setRemainingUsage] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchRemainingUsage = async () => {
      const remaining = await getRemainingApplications();
      setRemainingUsage(remaining || 0);
    };
    
    if (subscriptionStatus?.hasActiveSubscription) {
      fetchRemainingUsage();
    }
  }, [subscriptionStatus, getRemainingApplications]);

  const handleManageSubscription = async () => {
    try {
      await manageSubscription();
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  // Refresh subscription status (called after returning from portal)
  const handleRefresh = () => {
    checkSubscriptionStatus();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // No subscription — show upgrade prompt
  if (!subscriptionStatus?.hasActiveSubscription) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Choose a plan to unlock powerful features and start collaborating.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => window.location.href = '/pricing'}>
              View Pricing Plans
            </Button>
            <Button variant="outline" className="w-full" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Starter / free plan view
  const isStarterPlan = subscriptionStatus?.plan?.name?.toLowerCase().includes('starter');
  if (isStarterPlan) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {subscriptionStatus.plan?.name} (Free)
            </CardTitle>
            <CardDescription>
              Upgrade to unlock more features and grow faster.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Current Features:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {subscriptionStatus.plan?.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={() => window.location.href = '/pricing'} size="lg" className="w-full">
              <Rocket className="h-4 w-4 mr-2" />
              Upgrade Your Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plan = subscriptionStatus.plan;
  const currentPeriodEnd = subscriptionStatus.currentPeriodEnd 
    ? new Date(subscriptionStatus.currentPeriodEnd) 
    : null;
  const subStatus = subscriptionStatus.subscriptionStatus;
  const isPastDue = subStatus === 'past_due';
  const isCanceled = subStatus === 'canceled';
  const isCancelAtPeriodEnd = subscriptionStatus.cancelAtPeriodEnd;
  const isTrialing = subscriptionStatus.isTrialing;

  // Derive status badge variant and label
  const getStatusBadge = () => {
    if (isCanceled) return { label: 'Canceled', variant: 'destructive' as const };
    if (isPastDue) return { label: 'Past Due', variant: 'destructive' as const };
    if (isCancelAtPeriodEnd) return { label: 'Canceling', variant: 'secondary' as const };
    if (isTrialing) return { label: 'Trial', variant: 'secondary' as const };
    return { label: 'Active', variant: 'default' as const };
  };
  const statusBadge = getStatusBadge();

  // Calculate usage based on user type
  const getMaxUsage = () => {
    if (userTypeCategory === 'supply') {
      return plan?.maxPitchesPerMonth || plan?.maxApplicationsPerMonth || 0;
    }
    return plan?.maxOutboundInvitesPerMonth || 0;
  };
  
  const maxUsage = getMaxUsage();
  const usagePercentage = maxUsage && maxUsage > 0
    ? ((maxUsage - remainingUsage) / maxUsage) * 100
    : 0;

  const usageLabel = userTypeCategory === 'supply' ? 'Pitches' : 'Creator Invites';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Dashboard</h1>
          <p className="text-muted-foreground">Manage your subscription, referrals, and track usage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleManageSubscription} disabled={actionLoading}>
            <Settings className="h-4 w-4 mr-2" />
            {actionLoading ? 'Opening...' : 'Manage Subscription'}
          </Button>
        </div>
      </div>

      {/* Banner alerts for important states */}
      {isPastDue && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your payment has failed. Please update your payment method to keep your subscription active.{' '}
            <button
              className="underline font-medium"
              onClick={handleManageSubscription}
            >
              Update payment method
            </button>
          </AlertDescription>
        </Alert>
      )}

      {isCancelAtPeriodEnd && !isCanceled && currentPeriodEnd && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your subscription will cancel on{' '}
            <strong>{currentPeriodEnd.toLocaleDateString()}</strong>. You'll retain access until then.{' '}
            <button
              className="underline font-medium"
              onClick={handleManageSubscription}
            >
              Reactivate subscription
            </button>
          </AlertDescription>
        </Alert>
      )}

      {isCanceled && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Your subscription has been canceled.{' '}
            <button
              className="underline font-medium"
              onClick={() => window.location.href = '/pricing'}
            >
              Subscribe again
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="subscription" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Referrals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-6">
          {/* Current Plan Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{plan?.name}</div>
                <Badge variant={statusBadge.variant} className="mt-1">
                  {statusBadge.label}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Billing Cycle</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {subscriptionStatus.billingInterval || '—'}
                </div>
                {currentPeriodEnd && (
                  <p className="text-xs text-muted-foreground">
                    {isCancelAtPeriodEnd ? 'Ends' : isTrialing ? 'Trial ends' : 'Renews'}{' '}
                    {currentPeriodEnd.toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{usageLabel} Left</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {maxUsage === -1 ? '∞' : remainingUsage}
                </div>
                {maxUsage && maxUsage > 0 && (
                  <p className="text-xs text-muted-foreground">
                    of {maxUsage} this month
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                {isPastDue || isCanceled ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isPastDue || isCanceled ? 'text-destructive' : 'text-green-600'}`}>
                  {statusBadge.label}
                </div>
                {isCancelAtPeriodEnd && (
                  <p className="text-xs text-orange-600">
                    Cancels {currentPeriodEnd?.toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Verified Badge */}
          {userTypeCategory === 'supply' && plan?.hasVerifiedBadge && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">Verified Creator Badge</p>
                    <p className="text-sm text-muted-foreground">Your profile shows a verified badge to hosts and brands</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Progress */}
          {maxUsage && maxUsage > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Usage</CardTitle>
                <CardDescription>
                  Track your {usageLabel.toLowerCase()} for this billing period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>{usageLabel}</span>
                    <span>{maxUsage - remainingUsage} / {maxUsage}</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {remainingUsage} {usageLabel.toLowerCase()} remaining this month
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plan Features */}
          <Card>
            <CardHeader>
              <CardTitle>Your Plan Features</CardTitle>
              <CardDescription>
                What's included in your {plan?.name} subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan?.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your account and subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* All subscription management (upgrade, downgrade, cancel, update payment) goes through Stripe Billing Portal */}
                <Button variant="outline" onClick={handleManageSubscription} disabled={actionLoading}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button variant="outline" onClick={handleManageSubscription} disabled={actionLoading}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade / Downgrade
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/marketplace'}>
                  <Target className="h-4 w-4 mr-2" />
                  {userTypeCategory === 'supply' ? 'Browse Properties' : 'Find Creators'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <ReferralDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
