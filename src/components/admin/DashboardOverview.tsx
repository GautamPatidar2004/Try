import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Home, FileText, MessageSquare, Activity, HelpCircle, AlertTriangle, Handshake, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalPosts: number;
  totalApplications: number;
  totalSupportTickets: number;
  openSupportTickets: number;
  pendingApplications: number;
  activeCollaborations: number;
  pendingCollaborations: number;
  pastCollaborations: number;
  totalCollaborations: number;
  totalOpportunities: number;
  activeStays: number;
  openBrandDeals: number;
  pendingBrandDeals: number;
  pendingPayouts: number;
  newUsersThisWeek: number;
  newUsersLastWeek: number;
  recentActivity: any[];
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalPosts: 0,
    totalApplications: 0,
    totalSupportTickets: 0,
    openSupportTickets: 0,
    pendingApplications: 0,
    activeCollaborations: 0,
    pendingCollaborations: 0,
    pastCollaborations: 0,
    totalCollaborations: 0,
    totalOpportunities: 0,
    activeStays: 0,
    openBrandDeals: 0,
    pendingBrandDeals: 0,
    pendingPayouts: 0,
    newUsersThisWeek: 0,
    newUsersLastWeek: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: usersCount },
        { count: propertiesCount },
        { count: postsCount },
        { count: applicationsCount },
        { count: supportTicketsCount },
        { count: openSupportTicketsCount },
        { count: pendingApplicationsCount },
        { count: activeCollaborationsCount },
        { count: pendingCollaborationsCount },
        { count: completedCollaborationsCount },
        { count: cancelledCollaborationsCount },
        { count: totalCollaborationsCount },
        { count: activeStaysCount },
        { count: openBrandDealsCount },
        { count: pendingBrandDealsCount },
        { count: totalBrandDealsCount },
        { count: pendingPayoutsCount },
        { count: newUsersThisWeekCount },
        { count: newUsersLastWeekCount },
        { data: recentActivity },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('content_posts').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('collaboration_agreements').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('collaboration_agreements').select('*', { count: 'exact', head: true }).in('status', ['pending', 'pending_host', 'pending_influencer']),
        supabase.from('collaboration_agreements').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('collaboration_agreements').select('*', { count: 'exact', head: true }).in('status', ['cancelled', 'canceled']),
        supabase.from('collaboration_agreements').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('brand_campaigns').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('brand_campaigns').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('brand_campaigns').select('*', { count: 'exact', head: true }),
        supabase.from('ambassador_payouts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', twoWeeksAgo).lt('created_at', oneWeekAgo),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalProperties: propertiesCount || 0,
        totalPosts: postsCount || 0,
        totalApplications: applicationsCount || 0,
        totalSupportTickets: supportTicketsCount || 0,
        openSupportTickets: openSupportTicketsCount || 0,
        pendingApplications: pendingApplicationsCount || 0,
        activeCollaborations: activeCollaborationsCount || 0,
        pendingCollaborations: pendingCollaborationsCount || 0,
        pastCollaborations: (completedCollaborationsCount || 0) + (cancelledCollaborationsCount || 0),
        totalCollaborations: totalCollaborationsCount || 0,
        activeStays: activeStaysCount || 0,
        openBrandDeals: openBrandDealsCount || 0,
        pendingBrandDeals: pendingBrandDealsCount || 0,
        totalOpportunities: (propertiesCount || 0) + (totalBrandDealsCount || 0),
        pendingPayouts: pendingPayoutsCount || 0,
        newUsersThisWeek: newUsersThisWeekCount || 0,
        newUsersLastWeek: newUsersLastWeekCount || 0,
        recentActivity: recentActivity || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const userGrowth = stats.newUsersLastWeek > 0
    ? Math.round(((stats.newUsersThisWeek - stats.newUsersLastWeek) / stats.newUsersLastWeek) * 100)
    : stats.newUsersThisWeek > 0 ? 100 : 0;

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600", bgColor: "bg-blue-100", subtitle: `+${stats.newUsersThisWeek} this week (${userGrowth >= 0 ? '+' : ''}${userGrowth}%)` },
    { title: "Properties", value: stats.totalProperties, icon: Home, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Opportunities", value: stats.totalOpportunities, icon: Handshake, color: "text-purple-600", bgColor: "bg-purple-100", subtitle: `${stats.activeStays} active stays · ${stats.openBrandDeals} open brand deals · ${stats.pendingBrandDeals} pending` },
    { title: "Signed Agreements", value: stats.totalCollaborations, icon: Handshake, color: "text-pink-600", bgColor: "bg-pink-100", subtitle: `${stats.activeCollaborations} active · ${stats.pendingCollaborations} pending · ${stats.pastCollaborations} past` },
    { title: "Applications", value: stats.totalApplications, icon: MessageSquare, color: "text-orange-600", bgColor: "bg-orange-100" },
    { title: "Content Posts", value: stats.totalPosts, icon: FileText, color: "text-indigo-600", bgColor: "bg-indigo-100" },
  ];

  const needsAttention = [
    { label: "Pending Applications", count: stats.pendingApplications, icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100", section: "applications" },
    { label: "Open Support Tickets", count: stats.openSupportTickets, icon: HelpCircle, color: "text-red-600", bgColor: "bg-red-100", section: "support" },
    { label: "Pending Payouts", count: stats.pendingPayouts, icon: DollarSign, color: "text-emerald-600", bgColor: "bg-emerald-100", section: "ambassador" },
  ].filter(item => item.count > 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {needsAttention.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                    <div className={`p-2 rounded-full ${item.bgColor}`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <Badge variant="secondary" className="mt-1">{item.count}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent User Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.user_type ? `${user.user_type}` : 'User type not set'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
