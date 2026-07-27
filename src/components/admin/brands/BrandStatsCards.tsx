import { Card } from "@/components/ui/card";
import { Building2, CheckCircle, Megaphone, Clock } from "lucide-react";

interface BrandStatsCardsProps {
  stats: {
    total: number;
    verified: number;
    activeCampaigns: number;
    pendingVerification: number;
  };
}

export const BrandStatsCards = ({ stats }: BrandStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Brands</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <Building2 className="h-8 w-8 text-primary" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold mt-1">{stats.verified}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active Campaigns</p>
            <p className="text-2xl font-bold mt-1">{stats.activeCampaigns}</p>
          </div>
          <Megaphone className="h-8 w-8 text-blue-600" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold mt-1">{stats.pendingVerification}</p>
          </div>
          <Clock className="h-8 w-8 text-orange-600" />
        </div>
      </Card>
    </div>
  );
};
