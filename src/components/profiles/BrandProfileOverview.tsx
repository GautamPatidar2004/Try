import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Users, TrendingUp, Plus, Eye, Search, FileText, Handshake } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBrandDashboardStats } from "@/hooks/useBrandDashboardStats";
import { useNavigate } from "react-router-dom";

interface BrandProfileOverviewProps {
  profile: any;
  onTabChange?: (tab: string) => void;
}

const BrandProfileOverview = ({ profile, onTabChange }: BrandProfileOverviewProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useBrandDashboardStats(profile?.id);

  const statCards = [
    {
      title: "Active Campaigns",
      value: stats?.activeCampaigns || 0,
      description: "Currently running",
      icon: Megaphone,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => onTabChange?.('campaigns'),
    },
    {
      title: "Pending Applications",
      value: stats?.pendingApplications || 0,
      description: "Awaiting review",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      onClick: () => onTabChange?.('applications'),
    },
    {
      title: "Active Collaborations",
      value: stats?.completedCollaborations || 0,
      description: "Working with creators",
      icon: Handshake,
      color: "text-green-600",
      bgColor: "bg-green-50",
      onClick: () => onTabChange?.('collaborations'),
    },
    {
      title: "Campaign Views",
      value: stats?.totalViews || 0,
      description: "Total impressions",
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => onTabChange?.('analytics'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 lg:grid-cols-4 gap-4'}`}>
        {statCards.map((stat) => (
          <Card 
            key={stat.title}
            className="hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            onClick={stat.onClick}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                <span className="text-muted-foreground">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${stat.color} ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                {isLoading ? '...' : stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-3 gap-4'}`}>
            <Button 
              onClick={() => onTabChange?.('campaigns')}
              className="h-auto py-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Create Campaign</div>
                <div className="text-xs opacity-90">Start a new creator campaign</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => onTabChange?.('applications')}
              variant="outline"
              className="h-auto py-4"
            >
              <Users className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Review Applications</div>
                <div className="text-xs text-muted-foreground">{stats?.pendingApplications || 0} pending</div>
              </div>
            </Button>

            <Button 
              onClick={() => navigate('/discover')}
              variant="outline"
              className="h-auto py-4"
            >
              <Search className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Browse Creators</div>
                <div className="text-xs text-muted-foreground">Find creators to work with</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Guide - Show if no campaigns */}
      {!isLoading && stats?.activeCampaigns === 0 && (
        <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Megaphone className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Create Your First Campaign</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Start connecting with creators by creating your first campaign. 
                  Define your requirements, budget, and timeline to attract the perfect creators for your brand.
                </p>
              </div>
              <Button 
                onClick={() => onTabChange?.('campaigns')}
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity placeholder */}
      {stats?.activeCampaigns && stats.activeCampaigns > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{stats?.activeCampaigns || 0}</div>
                <div className="text-sm text-muted-foreground">Active Campaigns</div>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{stats?.completedCollaborations || 0}</div>
                <div className="text-sm text-muted-foreground">Creator Partnerships</div>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{stats?.totalViews?.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Total Reach</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrandProfileOverview;
