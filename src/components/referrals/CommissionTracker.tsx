import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, Clock } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { format } from 'date-fns';

export const CommissionTracker = () => {
  const { commissions, loading } = useReferrals();

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Commission History
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
          <DollarSign className="h-5 w-5" />
          Commission History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {commissions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Commissions Yet</h3>
            <p className="text-muted-foreground">
              Start referring users to earn your first commission!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {commissions.slice(0, 5).map((commission) => (
              <div
                key={commission.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {formatCurrency(commission.commission_amount)}
                    </span>
                    {getStatusBadge(commission.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(commission.subscription_period_start), 'MMM dd')} - {format(new Date(commission.subscription_period_end), 'MMM dd, yyyy')}
                    </div>
                    
                    {commission.paid_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Paid {format(new Date(commission.paid_at), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {commissions.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Showing 5 of {commissions.length} commissions
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};