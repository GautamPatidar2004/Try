import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { TopAffiliate } from "@/hooks/useAdminAffiliateManagement";

interface TopAffiliatesCardProps {
  affiliates: TopAffiliate[];
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

export const TopAffiliatesCard = ({ affiliates }: TopAffiliatesCardProps) => {
  if (affiliates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Affiliates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No affiliate data yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Affiliates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {affiliates.map((affiliate, index) => (
          <div
            key={affiliate.creator_id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground w-5">
                #{index + 1}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={affiliate.avatar_url || undefined} />
                <AvatarFallback>
                  {affiliate.creator_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{affiliate.creator_name}</p>
                <p className="text-xs text-muted-foreground">
                  {affiliate.total_conversions} conversions • {affiliate.active_codes} active codes
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-green-600">
                {formatCurrency(affiliate.total_earnings)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
