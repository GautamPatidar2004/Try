import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ReferralWithDetails, ReferralType, COMMISSION_RATES } from "@/hooks/useAmbassadorReferrals";
import { cn } from "@/lib/utils";
import { ArrowUpDown, MousePointer, UserCheck, List, Zap, Crown } from "lucide-react";
import { useState } from "react";

interface BaseReferralTableProps {
  referrals: ReferralWithDetails[];
  referralType: ReferralType;
  emptyMessage?: string;
}

type SortField = 'signup_date' | 'total_earned' | 'lifetime_value' | 'conversion_stage';
type SortDirection = 'asc' | 'desc';

const STAGE_CONFIG = {
  clicked: { label: 'Clicked', icon: MousePointer, variant: 'secondary' as const },
  signup: { label: 'Signed Up', icon: UserCheck, variant: 'outline' as const },
  listing: { label: 'Listed', icon: List, variant: 'default' as const },
  active: { label: 'Active', icon: Zap, variant: 'default' as const },
  subscription: { label: 'Subscribed', icon: Crown, variant: 'default' as const },
};

export const BaseReferralTable = ({ 
  referrals, 
  referralType,
  emptyMessage = "No referrals yet. Share your link to start earning!"
}: BaseReferralTableProps) => {
  const [sortField, setSortField] = useState<SortField>('signup_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const commissionInfo = COMMISSION_RATES[referralType];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedReferrals = [...referrals].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'signup_date':
        comparison = new Date(a.signup_date).getTime() - new Date(b.signup_date).getTime();
        break;
      case 'total_earned':
        comparison = (Number(a.total_earned) || 0) - (Number(b.total_earned) || 0);
        break;
      case 'lifetime_value':
        comparison = (Number(a.lifetime_value) || 0) - (Number(b.lifetime_value) || 0);
        break;
      case 'conversion_stage':
        const stageOrder = ['clicked', 'signup', 'listing', 'active', 'subscription'];
        comparison = stageOrder.indexOf(a.conversion_stage) - stageOrder.indexOf(b.conversion_stage);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getMonthlyCommission = (referral: ReferralWithDetails) => {
    if (commissionInfo.type === 'recurring') {
      const subscriptionAmount = referral.subscription_tier === 'pro' ? 25 : 
                                  referral.subscription_tier === 'basic' ? 10 : 0;
      return subscriptionAmount * (commissionInfo.base as number);
    }
    return 0;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={cn(
          "h-3 w-3",
          sortField === field ? "opacity-100" : "opacity-40"
        )} />
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Referral</TableHead>
            <SortableHeader field="signup_date">Signup Date</SortableHeader>
            <SortableHeader field="conversion_stage">Stage</SortableHeader>
            <TableHead>Commission Rate</TableHead>
            {commissionInfo.type === 'recurring' && (
              <TableHead>Monthly</TableHead>
            )}
            <SortableHeader field="total_earned">Total Earned</SortableHeader>
            <SortableHeader field="lifetime_value">Lifetime Value</SortableHeader>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReferrals.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={commissionInfo.type === 'recurring' ? 8 : 7} 
                className="text-center text-muted-foreground py-12"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">🔗</span>
                  <p>{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sortedReferrals.map((referral) => {
              const stageConfig = STAGE_CONFIG[referral.conversion_stage] || STAGE_CONFIG.signup;
              const StageIcon = stageConfig.icon;
              
              return (
                <TableRow key={referral.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={referral.profile?.profile_photo_url || ''} />
                        <AvatarFallback>
                          {referral.profile?.first_name?.[0] || '?'}
                          {referral.profile?.last_name?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {referral.profile?.first_name} {referral.profile?.last_name}
                        </p>
                        {referral.click_count > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {referral.click_count} clicks
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(referral.signup_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={stageConfig.variant} className="gap-1">
                      <StageIcon className="h-3 w-3" />
                      {stageConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {commissionInfo.description}
                  </TableCell>
                  {commissionInfo.type === 'recurring' && (
                    <TableCell>
                      ${getMonthlyCommission(referral).toFixed(2)}/mo
                    </TableCell>
                  )}
                  <TableCell className="font-medium text-green-600">
                    ${(Number(referral.total_earned) || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${(Number(referral.lifetime_value) || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                      {referral.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
