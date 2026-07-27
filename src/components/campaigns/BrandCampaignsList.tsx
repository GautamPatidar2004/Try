import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Megaphone, MoreHorizontal, Eye, Users, MousePointerClick, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface Campaign {
  id: string;
  campaign_title: string;
  campaign_description: string | null;
  total_budget: number | null;
  creator_payout: number | null;
  status: string | null;
  created_at: string | null;
  applications_count: number | null;
  views_count: number | null;
  compensation_type: string | null;
  required_niches: string[] | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  open: { label: "Running", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  active: { label: "Running", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  completed: { label: "Completed", className: "bg-blue-100 text-blue-800 border-blue-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
};

const iconColors = [
  "bg-rose-100 text-rose-600",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-sky-100 text-sky-600",
];

const BrandCampaignsList = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('id, campaign_title, campaign_description, total_budget, creator_payout, status, created_at, applications_count, views_count, compensation_type, required_niches')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setCampaigns(data);
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  const formatCents = (cents: number | null) =>
    cents != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(cents / 100) : '—';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create your first campaign to start connecting with creators.</p>
          <Button asChild variant="premium">
            <a href="/campaigns/create">Create Your First Campaign</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((c, index) => {
        const statusInfo = statusConfig[c.status || 'draft'] || statusConfig.draft;
        const displayStatus = statusInfo.label;
        const displayStatusClass = statusInfo.className;
        const iconColor = iconColors[index % iconColors.length];

        return (
          <Card key={c.id} className="hover:shadow-lg transition-all duration-200 border rounded-2xl">
            <CardContent className="p-6">
              {/* Top row: icon, title, description, status */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-foreground truncate text-base">{c.campaign_title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className={`rounded-full px-3 text-xs font-medium ${displayStatusClass}`}>
                        {c.status === 'open' || c.status === 'active' ? (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                        ) : null}
                        {displayStatus}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {c.campaign_description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{c.campaign_description}</p>
                  )}
                </div>
              </div>

              {/* Tags row */}
              {c.required_niches && c.required_niches.length > 0 && (
                <div className="flex items-center gap-2 mb-4 ml-14">
                  {c.required_niches.slice(0, 3).map((niche) => (
                    <Badge key={niche} variant="secondary" className="rounded-full text-xs font-normal px-3 py-0.5">
                      {niche}
                    </Badge>
                  ))}
                  {c.compensation_type && (
                    <Badge variant="secondary" className="rounded-full text-xs font-normal px-3 py-0.5">
                      {c.compensation_type === 'product' ? 'Gifted' : c.compensation_type === 'affiliate' ? 'Affiliate' : c.compensation_type === 'hybrid' ? 'Hybrid' : 'Paid'}
                    </Badge>
                  )}
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-6 ml-14 pt-3 border-t">
                <StatItem
                  value={formatCents(c.total_budget)}
                  label="Budget"
                  icon={<span className="text-base font-bold text-foreground">{formatCents(c.total_budget)}</span>}
                  isValue
                />
                <StatItem
                  value={c.applications_count || 0}
                  label="Applications"
                  sublabel="Total"
                />
                <StatItem
                  value={c.views_count || 0}
                  label="Views"
                  sublabel="Total"
                />
                <StatItem
                  value={formatCents(c.creator_payout)}
                  label="Creator Pool"
                  icon={<span className="text-base font-bold text-primary">{formatCents(c.creator_payout)}</span>}
                  isValue
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

interface StatItemProps {
  value: string | number;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  isValue?: boolean;
}

const StatItem = ({ value, label, sublabel, icon, isValue }: StatItemProps) => (
  <div className="flex items-baseline gap-2">
    {isValue ? (
      icon
    ) : (
      <span className="text-2xl font-bold text-foreground">{value}</span>
    )}
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      {sublabel && <span className="text-[10px] text-muted-foreground/70">{sublabel}</span>}
    </div>
  </div>
);

export default BrandCampaignsList;
