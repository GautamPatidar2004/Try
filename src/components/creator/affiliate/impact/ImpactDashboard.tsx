import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, ExternalLink, AlertCircle, DollarSign, TrendingUp, Activity, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useImpactSummary,
  useImpactLinks,
  useImpactActions,
  useImpactPayouts,
} from "@/hooks/useImpactAffiliate";

const fmtMoney = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c || "USD" }).format(n || 0);

const stateVariant = (s: string) => {
  if (s === "APPROVED" || s === "LOCKED") return "default";
  if (s === "PENDING") return "secondary";
  if (s === "REVERSED") return "destructive";
  return "outline";
};

const ImpactDashboard = () => {
  const { toast } = useToast();
  const summary = useImpactSummary(30);
  const links = useImpactLinks();
  const actions = useImpactActions(90);
  const payouts = useImpactPayouts();

  const [copying, setCopying] = useState<string | null>(null);

  const error =
    summary.error || links.error || actions.error || payouts.error;

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="font-medium">Couldn't load Impact.com data</p>
          <p className="text-sm text-muted-foreground">
            {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const copy = async (url: string, id: string) => {
    setCopying(id);
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Tracking link copied to clipboard." });
    setTimeout(() => setCopying(null), 1500);
  };

  const s = summary.data;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Approved (30d)"
          value={summary.isLoading ? "—" : fmtMoney(s?.approvedEarnings || 0)}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Pending (30d)"
          value={summary.isLoading ? "—" : fmtMoney(s?.pendingEarnings || 0)}
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Actions (30d)"
          value={summary.isLoading ? "—" : String(s?.actionCount || 0)}
        />
        <StatCard
          icon={<Wallet className="h-4 w-4" />}
          label="Sales (30d)"
          value={summary.isLoading ? "—" : fmtMoney(s?.totalSales || 0)}
        />
      </div>

      <Tabs defaultValue="links" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="links">Tracking Links</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Tracking Links</CardTitle>
            </CardHeader>
            <CardContent>
              {links.isLoading ? (
                <Loader />
              ) : !links.data?.links.length ? (
                <Empty text="No campaigns available yet. Apply to brand campaigns in Impact.com to get tracking links." />
              ) : (
                <div className="space-y-2">
                  {links.data.links.map((l) => (
                    <div
                      key={l.campaignId}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{l.campaignName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {l.advertiserName} · {l.contractStatus}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {l.trackingUrl && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copy(l.trackingUrl!, l.campaignId)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              {copying === l.campaignId ? "Copied" : "Copy"}
                            </Button>
                            <Button size="sm" variant="ghost" asChild>
                              <a href={l.trackingUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity (90 days)</CardTitle>
            </CardHeader>
            <CardContent>
              {actions.isLoading ? (
                <Loader />
              ) : !actions.data?.actions.length ? (
                <Empty text="No conversions recorded yet. Share your tracking links to start earning." />
              ) : (
                <div className="space-y-2">
                  {actions.data.actions.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{a.campaignName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.actionDate).toLocaleDateString()} · {a.customerArea || "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold">
                          {fmtMoney(a.payout, a.currency)}
                        </span>
                        <Badge variant={stateVariant(a.state) as any}>{a.state}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {payouts.isLoading ? (
                <Loader />
              ) : (
                <>
                  <Section title="Payments">
                    {!payouts.data?.payments.length ? (
                      <Empty text="No payments yet." />
                    ) : (
                      payouts.data.payments.map((p) => (
                        <Row
                          key={p.id}
                          left={`${new Date(p.paidAt).toLocaleDateString()} · ${p.method || "—"}`}
                          right={fmtMoney(p.amount, p.currency)}
                          badge={p.status}
                        />
                      ))
                    )}
                  </Section>
                  <Section title="Invoices">
                    {!payouts.data?.invoices.length ? (
                      <Empty text="No invoices yet." />
                    ) : (
                      payouts.data.invoices.map((i) => (
                        <Row
                          key={i.id}
                          left={`${new Date(i.date).toLocaleDateString()}`}
                          right={fmtMoney(i.amount, i.currency)}
                          badge={i.status}
                        />
                      ))
                    )}
                  </Section>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

const Loader = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <p className="text-sm text-muted-foreground text-center py-6">{text}</p>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-sm font-semibold mb-2">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const Row = ({ left, right, badge }: { left: string; right: string; badge?: string }) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
    <span className="text-sm truncate">{left}</span>
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm font-semibold">{right}</span>
      {badge && <Badge variant="outline">{badge}</Badge>}
    </div>
  </div>
);

export default ImpactDashboard;