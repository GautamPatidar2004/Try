import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  MousePointerClick, 
  UserPlus, 
  Send, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Package,
  CreditCard,
  Clock
} from "lucide-react";
import { useProductEventAnalytics } from "@/hooks/useProductEventAnalytics";
import { DateRange } from "@/hooks/usePlatformAnalytics";
import { formatDistanceToNow } from "date-fns";

interface ProductEventsDashboardProps {
  dateRange: DateRange;
}

export const ProductEventsDashboard = ({ dateRange }: ProductEventsDashboardProps) => {
  const { data: analytics, isLoading } = useProductEventAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      host: 'Host',
      influencer: 'Creator',
      brand: 'Brand',
      restaurant_owner: 'Restaurant',
    };
    return names[role] || role;
  };

  const getEventIcon = (eventName: string) => {
    if (eventName.includes('cta')) return <MousePointerClick className="h-4 w-4" />;
    if (eventName.includes('signup')) return <UserPlus className="h-4 w-4" />;
    if (eventName.includes('invite')) return <Send className="h-4 w-4" />;
    if (eventName.includes('assets')) return <Package className="h-4 w-4" />;
    if (eventName.includes('subscription')) return <CreditCard className="h-4 w-4" />;
    return <BarChart3 className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tracked users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.inviteFunnel.sent > 0 
                ? `${analytics.inviteFunnel.acceptanceRate.toFixed(1)}%`
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Invite acceptance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Type Breakdown */}
      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(analytics.eventsByType).map(([type, count]) => (
          <Card key={type}>
            <CardContent className="pt-4">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {type}
              </div>
              <div className="text-xl font-bold mt-1">{count.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="acquisition" className="space-y-4">
        <TabsList>
          <TabsTrigger value="acquisition">
            <UserPlus className="w-4 h-4 mr-2" />
            Acquisition
          </TabsTrigger>
          <TabsTrigger value="invites">
            <Send className="w-4 h-4 mr-2" />
            Invites
          </TabsTrigger>
          <TabsTrigger value="ctas">
            <MousePointerClick className="w-4 h-4 mr-2" />
            CTAs
          </TabsTrigger>
          <TabsTrigger value="stream">
            <Clock className="w-4 h-4 mr-2" />
            Event Stream
          </TabsTrigger>
        </TabsList>

        {/* Acquisition Funnel Tab */}
        <TabsContent value="acquisition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signup Funnel by Role</CardTitle>
              <CardDescription>
                Conversion from signup start to completion, segmented by user type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {analytics.acquisitionFunnel.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No signup data available for this period
                </p>
              ) : (
                analytics.acquisitionFunnel.map((funnel) => (
                  <div key={funnel.role} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{getRoleName(funnel.role)}</span>
                      <Badge variant={funnel.conversionRate >= 50 ? "default" : "secondary"}>
                        {funnel.conversionRate.toFixed(1)}% conversion
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Signup Started</span>
                        <span className="font-medium">{funnel.signupStart.toLocaleString()}</span>
                      </div>
                      <Progress value={100} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Signup Completed</span>
                        <span className="font-medium">{funnel.signupComplete.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={funnel.conversionRate} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invite Funnel Tab */}
        <TabsContent value="invites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invite Funnel</CardTitle>
              <CardDescription>
                Track invite outcomes from sent to final response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Sent</span>
                  </div>
                  <div className="text-3xl font-bold">{analytics.inviteFunnel.sent}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Accepted</span>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {analytics.inviteFunnel.accepted}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {analytics.inviteFunnel.acceptanceRate.toFixed(1)}% rate
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">Declined</span>
                  </div>
                  <div className="text-3xl font-bold text-destructive">
                    {analytics.inviteFunnel.declined}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {analytics.inviteFunnel.declineRate.toFixed(1)}% rate
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Countered</span>
                  </div>
                  <div className="text-3xl font-bold text-secondary-foreground">
                    {analytics.inviteFunnel.countered}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {analytics.inviteFunnel.counterRate.toFixed(1)}% rate
                  </div>
                </div>
              </div>

              {analytics.inviteFunnel.sent > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Distribution</span>
                    </div>
                    <div className="flex h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary" 
                        style={{ width: `${analytics.inviteFunnel.acceptanceRate}%` }}
                      />
                      <div 
                        className="bg-destructive" 
                        style={{ width: `${analytics.inviteFunnel.declineRate}%` }}
                      />
                      <div 
                        className="bg-secondary" 
                        style={{ width: `${analytics.inviteFunnel.counterRate}%` }}
                      />
                      <div 
                        className="bg-muted" 
                        style={{ 
                          width: `${100 - analytics.inviteFunnel.acceptanceRate - analytics.inviteFunnel.declineRate - analytics.inviteFunnel.counterRate}%` 
                        }}
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded" />
                        Accepted
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-destructive rounded" />
                        Declined
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-secondary rounded" />
                        Countered
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-muted rounded" />
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA Performance Tab */}
        <TabsContent value="ctas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CTA Performance</CardTitle>
              <CardDescription>
                Marketing call-to-action click performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topCtas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No CTA click data available for this period
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics.topCtas.map((cta, index) => (
                    <div 
                      key={`${cta.cta_name}-${cta.page}`}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{cta.cta_name}</div>
                          <div className="text-xs text-muted-foreground">{cta.page}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{cta.clicks.toLocaleString()} clicks</div>
                        <div className="text-xs text-muted-foreground">
                          {cta.uniqueUsers.toLocaleString()} unique users
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Stream Tab */}
        <TabsContent value="stream" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Real-time feed of tracked events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {analytics.recentEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No events recorded in this period
                  </p>
                ) : (
                  <div className="space-y-2">
                    {analytics.recentEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="mt-0.5">
                          {getEventIcon(event.event_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{event.event_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {event.event_type}
                            </Badge>
                          </div>
                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1 truncate">
                              {Object.entries(event.metadata)
                                .filter(([key]) => !['page_path', 'referrer', 'user_agent', 'timestamp'].includes(key))
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(' • ')}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
