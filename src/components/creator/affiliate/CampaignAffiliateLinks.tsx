import { useState } from "react";
import { Copy, Check, Link2, Loader2, TrendingUp, MousePointerClick, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrandCard } from "@/components/ui/brand-card";
import { useToast } from "@/hooks/use-toast";
import { useCampaignAffiliateLinks, buildTrackableUrl } from "@/hooks/useCampaignAffiliateLinks";

const CampaignAffiliateLinks = () => {
  const { toast } = useToast();
  const { links, eligibleCampaigns, isLoading, generateLink, isGenerating } = useCampaignAffiliateLinks();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const linkedCampaignIds = new Set(links.map(l => l.campaign_id));
  const pendingEligible = eligibleCampaigns.filter((e: any) => !linkedCampaignIds.has(e.campaign_id));

  const copy = (slug: string) => {
    navigator.clipboard.writeText(buildTrackableUrl(slug));
    setCopiedSlug(slug);
    toast({ title: "Copied!", description: "Affiliate URL copied to clipboard." });
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (links.length === 0 && pendingEligible.length === 0) {
    return (
      <BrandCard variant="gradient" className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Link2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No Brand Affiliate Links Yet</h3>
          <p className="text-muted-foreground">
            Get accepted into a brand campaign with affiliate program enabled to generate trackable URLs.
          </p>
        </div>
      </BrandCard>
    );
  }

  return (
    <div className="space-y-4">
      {pendingEligible.length > 0 && (
        <BrandCard className="p-4 sm:p-6">
          <h3 className="font-semibold mb-3">Generate New Affiliate Links</h3>
          <div className="space-y-2">
            {pendingEligible.map((e: any) => (
              <div key={e.campaign_id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card">
                <div className="min-w-0">
                  <p className="font-medium truncate">{e.campaign.campaign_title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {e.campaign.brand_name} · {e.campaign.affiliate_percentage}% commission
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => generateLink(e.campaign_id)}
                  disabled={isGenerating}
                  className="shrink-0"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
                </Button>
              </div>
            ))}
          </div>
        </BrandCard>
      )}

      {links.map(link => {
        const url = buildTrackableUrl(link.slug);
        const conversionRate = link.clicks_count > 0
          ? ((link.conversions_count / link.clicks_count) * 100).toFixed(1)
          : "0.0";
        return (
          <BrandCard key={link.id} variant="glow" className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold truncate">{link.campaign?.campaign_title || "Campaign"}</h4>
                  <Badge variant="secondary">{link.commission_rate}% commission</Badge>
                  {!link.is_active && <Badge variant="outline">Inactive</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{link.campaign?.brand_name}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Input value={url} readOnly className="font-mono text-xs sm:text-sm h-11 bg-muted/50" />
              <Button
                onClick={() => copy(link.slug)}
                variant="outline"
                size="icon"
                className="min-w-[44px] min-h-[44px]"
              >
                {copiedSlug === link.slug ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat icon={<MousePointerClick className="h-4 w-4" />} label="Clicks" value={link.clicks_count.toString()} />
              <Stat icon={<TrendingUp className="h-4 w-4" />} label="Conversions" value={link.conversions_count.toString()} />
              <Stat icon={<TrendingUp className="h-4 w-4" />} label="Conv. Rate" value={`${conversionRate}%`} />
              <Stat icon={<DollarSign className="h-4 w-4" />} label="Earned" value={`$${(link.total_commission_cents / 100).toFixed(2)}`} />
            </div>
          </BrandCard>
        );
      })}
    </div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
    <div className="text-primary">{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-semibold truncate">{value}</p>
    </div>
  </div>
);

export default CampaignAffiliateLinks;