import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { ReferralCodeGenerator } from './ReferralCodeGenerator';
import { ReferralHistory } from './ReferralHistory';
import { CommissionTracker } from './CommissionTracker';

export const ReferralDashboard = () => {
  const { stats, loading } = useReferrals();

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const statCards = [
    {
      title: 'Total Referrals',
      value: stats.totalReferrals,
      icon: Users,
      description: 'People you have referred'
    },
    {
      title: 'Active Referrals',
      value: stats.activeReferrals,
      icon: CheckCircle,
      description: 'Currently active subscriptions'
    },
    {
      title: 'Pending Commissions',
      value: formatCurrency(stats.pendingCommissions),
      icon: Clock,
      description: 'Awaiting payment',
      highlight: true
    },
    {
      title: 'Paid Commissions',
      value: formatCurrency(stats.paidCommissions),
      icon: DollarSign,
      description: 'Total earnings received'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className={stat.highlight ? 'ring-2 ring-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral Code Generator */}
      <ReferralCodeGenerator />

      {/* Commission Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommissionTracker />
        <ReferralHistory />
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto mb-2">
                1
              </div>
              <h4 className="font-medium mb-1">Share Your Code</h4>
              <p className="text-sm text-muted-foreground">
                Share your unique referral code with travel creators
              </p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto mb-2">
                2
              </div>
              <h4 className="font-medium mb-1">They Subscribe</h4>
              <p className="text-sm text-muted-foreground">
                When they sign up using your code and purchase a plan
              </p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto mb-2">
                3
              </div>
              <h4 className="font-medium mb-1">Earn 10% Monthly</h4>
              <p className="text-sm text-muted-foreground">
                Get 10% commission every month they stay subscribed
              </p>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-medium">Commission Example</span>
            </div>
            <p className="text-sm text-muted-foreground">
              If someone subscribes to a $30/month plan using your code, you'll earn $3 every month they stay subscribed. 
              That's $36 per year per active referral!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};