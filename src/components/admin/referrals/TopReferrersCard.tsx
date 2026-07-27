import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

interface TopReferrer {
  id: string;
  name: string;
  totalReferrals: number;
  activeReferrals: number;
  earnings: number;
}

interface TopReferrersCardProps {
  topReferrers: TopReferrer[];
}

export const TopReferrersCard = ({ topReferrers }: TopReferrersCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Referrers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topReferrers.slice(0, 5).map((referrer, index) => (
            <div key={referrer.id} className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl font-bold text-muted-foreground w-6">
                  {index + 1}
                </span>
                <Avatar>
                  <AvatarFallback>{getInitials(referrer.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{referrer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {referrer.totalReferrals} referrals ({referrer.activeReferrals} active)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(referrer.earnings)}</p>
                <p className="text-xs text-muted-foreground">earned</p>
              </div>
            </div>
          ))}
          {topReferrers.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No referrers yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
