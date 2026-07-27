import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUpdateBrandCampaign } from "@/hooks/useBrandCampaignMutations";
import { Save, Loader2, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { BrandCampaign } from "../AdminCampaignCard";

interface CampaignDetailsTabProps {
  campaign: BrandCampaign;
}

const NICHE_OPTIONS = ["Travel", "Lifestyle", "Food", "Fashion", "Fitness", "Beauty", "Tech", "Photography", "Adventure", "Luxury", "Family", "Wellness", "Sustainability"];
const PLATFORM_OPTIONS = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook", "Pinterest", "Blog"];
const DELIVERABLE_OPTIONS = ["Instagram Post", "Instagram Reel", "Instagram Story", "TikTok Video", "YouTube Video", "YouTube Short", "Blog Post", "Twitter Thread", "Pinterest Pin"];
const CAMPAIGN_TYPE_OPTIONS = [
  { value: "ugc", label: "UGC Content" },
  { value: "sponsored_post", label: "Sponsored Post" },
  { value: "brand_ambassador", label: "Brand Ambassador" },
  { value: "product_review", label: "Product Review" },
  { value: "giveaway", label: "Giveaway" },
  { value: "event", label: "Event" },
  { value: "affiliate", label: "Affiliate" },
  { value: "other", label: "Other" },
];

const ChipSelector = ({ options, selected, onChange, label }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; label: string }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const isSelected = selected.includes(opt);
        return (
          <Badge
            key={opt}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => onChange(isSelected ? selected.filter(s => s !== opt) : [...selected, opt])}
          >
            {opt}
            {isSelected && <X className="h-3 w-3 ml-1" />}
          </Badge>
        );
      })}
    </div>
  </div>
);

const DatePickerField = ({ label, value, onChange }: { label: string; value: Date | undefined; onChange: (d: Date | undefined) => void }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          {value ? format(value, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  </div>
);

export const CampaignDetailsTab = ({ campaign }: CampaignDetailsTabProps) => {
  const updateCampaign = useUpdateBrandCampaign();

  const [form, setForm] = useState({
    campaign_title: campaign.campaign_title,
    campaign_description: campaign.campaign_description,
    campaign_type: campaign.campaign_type || "",
    campaign_brief_url: campaign.campaign_brief_url || "",
    campaign_image_url: campaign.campaign_image_url || "",
    target_destination: campaign.target_destination || "",
    brand_name: campaign.brand_name,
    brand_website: campaign.brand_website || "",
    brand_description: campaign.brand_description || "",
    compensation_type: campaign.compensation_type,
    currency: campaign.currency || "eur",
    budget_min: campaign.budget_min ?? "",
    budget_max: campaign.budget_max ?? "",
    product_value: campaign.product_value ?? "",
    min_followers: campaign.min_followers ?? "",
    max_followers: campaign.max_followers ?? "",
    min_engagement_rate: campaign.min_engagement_rate ?? "",
    required_niches: campaign.required_niches || [],
    required_platforms: campaign.required_platforms || [],
    deliverables: campaign.deliverables || [],
    content_requirements: campaign.content_requirements || [],
    geo_focus: campaign.geo_focus || "",
    requirements: campaign.requirements || "",
    spots_available: campaign.spots_available ?? "",
    visibility: campaign.visibility || "public",
    affiliate_enabled: campaign.affiliate_enabled ?? false,
    affiliate_percentage: campaign.affiliate_percentage ?? "",
    timeline_start: campaign.timeline_start ? new Date(campaign.timeline_start) : undefined as Date | undefined,
    timeline_end: campaign.timeline_end ? new Date(campaign.timeline_end) : undefined as Date | undefined,
    application_deadline: campaign.application_deadline ? new Date(campaign.application_deadline) : undefined as Date | undefined,
  });

  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm(f => ({
      ...f,
      [key]: value,
      ...(key === 'compensation_type' && value === 'affiliate' ? { affiliate_enabled: true } : {}),
    }));

  const handleSave = () => {
    updateCampaign.mutate({
      id: campaign.id,
      data: {
        campaign_title: form.campaign_title,
        campaign_description: form.campaign_description,
        brand_name: form.brand_name,
        compensation_type: form.compensation_type as "paid" | "product" | "hybrid" | "affiliate",
        budget_min: form.budget_min ? Number(form.budget_min) : undefined,
        budget_max: form.budget_max ? Number(form.budget_max) : undefined,
        spots_available: form.spots_available ? Number(form.spots_available) : undefined,
        // New fields
        brand_website: form.brand_website || undefined,
        brand_description: form.brand_description || undefined,
        campaign_type: form.campaign_type || undefined,
        campaign_brief_url: form.campaign_brief_url || undefined,
        campaign_image_url: form.campaign_image_url || undefined,
        target_destination: form.target_destination || undefined,
        currency: form.currency,
        product_value: form.product_value ? Number(form.product_value) : undefined,
        min_followers: form.min_followers ? Number(form.min_followers) : 0,
        max_followers: form.max_followers ? Number(form.max_followers) : undefined,
        min_engagement_rate: form.min_engagement_rate ? Number(form.min_engagement_rate) : undefined,
        required_niches: form.required_niches,
        required_platforms: form.required_platforms,
        deliverables: form.deliverables,
        content_requirements: form.content_requirements,
        geo_focus: form.geo_focus || undefined,
        requirements: form.requirements || undefined,
        visibility: form.visibility as "public" | "private",
        affiliate_enabled: form.affiliate_enabled,
        affiliate_percentage: form.affiliate_percentage ? Number(form.affiliate_percentage) : undefined,
        timeline_start: form.timeline_start?.toISOString(),
        timeline_end: form.timeline_end?.toISOString(),
        application_deadline: form.application_deadline?.toISOString(),
      } as any,
    });
  };

  return (
    <div className="space-y-4 pt-4">
      <Accordion type="multiple" defaultValue={["brand", "campaign", "compensation", "creators", "deliverables", "affiliate", "timeline"]} className="space-y-2">
        {/* Brand Info */}
        <AccordionItem value="brand">
          <AccordionTrigger className="text-sm font-semibold">Brand Info</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="space-y-2">
              <Label>Brand Name</Label>
              <Input value={form.brand_name} onChange={e => set("brand_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Brand Website</Label>
              <Input value={form.brand_website} onChange={e => set("brand_website", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Brand Description</Label>
              <Textarea value={form.brand_description} onChange={e => set("brand_description", e.target.value)} rows={3} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Campaign Details */}
        <AccordionItem value="campaign">
          <AccordionTrigger className="text-sm font-semibold">Campaign Details</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="space-y-2">
              <Label>Campaign Title</Label>
              <Input value={form.campaign_title} onChange={e => set("campaign_title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.campaign_description} onChange={e => set("campaign_description", e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select value={form.campaign_type} onValueChange={v => set("campaign_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Destination</Label>
                <Input value={form.target_destination} onChange={e => set("target_destination", e.target.value)} placeholder="e.g. Bali, Maldives" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Campaign Brief URL</Label>
                <Input value={form.campaign_brief_url} onChange={e => set("campaign_brief_url", e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Campaign Image URL</Label>
                <Input value={form.campaign_image_url} onChange={e => set("campaign_image_url", e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Compensation & Budget */}
        <AccordionItem value="compensation">
          <AccordionTrigger className="text-sm font-semibold">Compensation & Budget</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Compensation Type</Label>
                <Select value={form.compensation_type} onValueChange={v => set("compensation_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="product">Product / Gifted</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="affiliate">Affiliate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={v => set("currency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.compensation_type !== "affiliate" && (
            <div className="grid grid-cols-3 gap-3">
              {(form.compensation_type === "paid" || form.compensation_type === "hybrid") && (
                <>
                  <div className="space-y-2">
                    <Label>Budget Min</Label>
                    <Input type="number" value={form.budget_min} onChange={e => set("budget_min", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Budget Max</Label>
                    <Input type="number" value={form.budget_max} onChange={e => set("budget_max", e.target.value)} />
                  </div>
                </>
              )}
              {(form.compensation_type === "product" || form.compensation_type === "hybrid") && (
                <div className="space-y-2">
                  <Label>Product Value</Label>
                  <Input type="number" value={form.product_value} onChange={e => set("product_value", e.target.value)} />
                </div>
              )}
            </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Creator Requirements */}
        <AccordionItem value="creators">
          <AccordionTrigger className="text-sm font-semibold">Creator Requirements</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Min Followers</Label>
                <Input type="number" value={form.min_followers} onChange={e => set("min_followers", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Followers</Label>
                <Input type="number" value={form.max_followers} onChange={e => set("max_followers", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Min Engagement %</Label>
                <Input type="number" step="0.1" value={form.min_engagement_rate} onChange={e => set("min_engagement_rate", e.target.value)} />
              </div>
            </div>
            <ChipSelector label="Required Niches" options={NICHE_OPTIONS} selected={form.required_niches} onChange={v => set("required_niches", v)} />
            <ChipSelector label="Required Platforms" options={PLATFORM_OPTIONS} selected={form.required_platforms} onChange={v => set("required_platforms", v)} />
            <div className="space-y-2">
              <Label>Additional Requirements</Label>
              <Textarea value={form.requirements} onChange={e => set("requirements", e.target.value)} rows={2} placeholder="Any extra requirements..." />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Deliverables & Content */}
        <AccordionItem value="deliverables">
          <AccordionTrigger className="text-sm font-semibold">Deliverables & Content</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <ChipSelector label="Deliverables" options={DELIVERABLE_OPTIONS} selected={form.deliverables} onChange={v => set("deliverables", v)} />
            <ChipSelector label="Content Requirements" options={["High-quality photos", "Video content", "Behind-the-scenes", "Product showcase", "Testimonial", "Unboxing"]} selected={form.content_requirements} onChange={v => set("content_requirements", v)} />
            <div className="space-y-2">
              <Label>Geo Focus</Label>
              <Input value={form.geo_focus} onChange={e => set("geo_focus", e.target.value)} placeholder="e.g. Europe, North America" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Affiliate Program */}
        <AccordionItem value="affiliate">
          <AccordionTrigger className="text-sm font-semibold">Affiliate Program</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Affiliate Program</Label>
                <p className="text-xs text-muted-foreground">Creators earn commission on conversions</p>
              </div>
              <Switch checked={form.affiliate_enabled} onCheckedChange={v => set("affiliate_enabled", v)} />
            </div>
            {form.affiliate_enabled && (
              <div className="space-y-2">
                <Label>Commission Percentage (%)</Label>
                <Input type="number" step="0.5" min="0" max="100" value={form.affiliate_percentage} onChange={e => set("affiliate_percentage", e.target.value)} />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Timeline & Availability */}
        <AccordionItem value="timeline">
          <AccordionTrigger className="text-sm font-semibold">Timeline & Availability</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <DatePickerField label="Campaign Start" value={form.timeline_start} onChange={d => set("timeline_start", d)} />
              <DatePickerField label="Campaign End" value={form.timeline_end} onChange={d => set("timeline_end", d)} />
            </div>
            <DatePickerField label="Application Deadline" value={form.application_deadline} onChange={d => set("application_deadline", d)} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Spots Available</Label>
                <Input type="number" value={form.spots_available} onChange={e => set("spots_available", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={form.visibility} onValueChange={v => set("visibility", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button onClick={handleSave} disabled={updateCampaign.isPending} className="w-full">
        {updateCampaign.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
        Save Changes
      </Button>
    </div>
  );
};
