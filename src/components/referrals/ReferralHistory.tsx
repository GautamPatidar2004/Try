import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Calendar } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { format } from 'date-fns';

export const ReferralHistory = () => {
  const { referrals, loading } = useReferrals();

  const getStatusBadge = (referral: any) => {
    const subscriptionStatus = referral.subscriptions?.status;
    
    switch (subscriptionStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getUserInitials = (referral: any) => {
    const firstName = referral.profiles?.first_name || '';
    const lastName = referral.profiles?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Referral History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Referral History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Referrals Yet</h3>
            <p className="text-muted-foreground">
              Share your referral code to see your referrals here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getUserInitials(referral)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">
                      {referral.profiles?.first_name} {referral.profiles?.last_name}
                    </span>
                    {getStatusBadge(referral)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {format(new Date(referral.created_at), 'MMM dd, yyyy')}
                    </div>
                    
                    {referral.subscriptions?.subscription_plans && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {referral.subscriptions.subscription_plans.name}
                      </span>
                    )}
                  </div>
                </div>

                {referral.subscriptions?.subscription_plans && (
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${referral.subscriptions.subscription_plans.price_monthly}/mo
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${(referral.subscriptions.subscription_plans.price_monthly * 0.1).toFixed(2)} commission
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};