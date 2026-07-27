import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, ArrowRight, Loader2, DollarSign, Gift, Link } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import PricingBreakdownCard from "./PricingBreakdownCard";
import CampaignReviewStep from "./CampaignReviewStep";

const CAMPAIGN_TYPES = ["UGC Video", "Instagram Reel", "TikTok", "Blog Post", "Multi-Platform"];
const NICHES = ["Travel", "Food", "Lifestyle", "Adventure", "Luxury", "Budget", "Family", "Solo"];
const FOLLOWER_OPTIONS = [
  { label: "1K+", value: "1000" },
  { label: "5K+", value: "5000" },
  { label: "10K+", value: "10000" },
  { label: "50K+", value: "50000" },
  { label: "100K+", value: "100000" },
];

export interface CampaignFormData {
  campaign_title: string;
  campaign_description: string;
  campaign_type: string;
  target_destination: string;
  deliverables_count: number;
  start_date: Date | undefined;
  end_date: Date | undefined;
  creator_niche: string[];
  min_followers: string;
  creators_needed: number;
  geo_focus: string;
  requirements: string;
  total_budget: number;
  compensation_type: "paid" | "gifted" | "affiliate";
  product_description: string;
  affiliate_percentage: number;
  campaign_subject_type: "property_stay" | "platform_brand";
  property_id?: string;

}

const initialFormData: CampaignFormData = {
  campaign_title: "",
  campaign_description: "",
  campaign_type: "",
  target_destination: "",
  deliverables_count: 1,
  start_date: undefined,
  end_date: undefined,
  creator_niche: [],
  min_followers: "1000",
  creators_needed: 1,
  geo_focus: "",
  requirements: "",
  total_budget: 500,
  compensation_type: "paid",
  product_description: "",
  affiliate_percentage: 10,
  campaign_subject_type: "platform_brand",
  property_id: "",
};

const CampaignCreateForm = () => {
  const navigate = useNavigate();
  const { subscriptionStatus, loading: subscriptionLoading } = useSubscription();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;
  const isGifted = formData.compensation_type === "gifted";
  const isAffiliate = formData.compensation_type === "affiliate";

  const updateField = <K extends keyof CampaignFormData>(key: K, value: CampaignFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleNiche = (niche: string) => {
    setFormData(prev => ({
      ...prev,
      creator_niche: prev.creator_niche.includes(niche)
        ? prev.creator_niche.filter(n => n !== niche)
        : [...prev.creator_niche, niche],
    }));
  };
  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*");
      if (!error && data) {
        setProperties(data);
      }
    };
  
    fetchProperties();
  }, []);
  const canProceed = () => {
    switch (step) {
      case 1:
        if (
          formData.campaign_title.length < 3 ||
          formData.campaign_description.length < 10 ||
          !formData.campaign_type
        ) {
          return false;
        }
      
        if (
          formData.campaign_subject_type === "property_stay" &&
          !formData.property_id
        ) {
          return false;
        }
      
      
        return true;
      case 2:
        return formData.creator_niche.length > 0;
      case 3:
        if (isGifted || isAffiliate) return true;
        return formData.total_budget >= 500;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!subscriptionStatus?.hasActiveSubscription) {
      toast({
        title: "Active Subscription Required",
        description: "Please subscribe to a plan to start creating campaigns.",
        variant: "destructive"
      });
      navigate('/pricing');
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const brandName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Brand' : 'Brand';
      
      const totalBudgetCents = (isGifted || isAffiliate) ? 0 : Math.round(formData.total_budget * 100);
      const platformFeeCents = Math.round(totalBudgetCents * 0.2);
      const creatorPayoutCents = totalBudgetCents - platformFeeCents;

      const { error } = await supabase
        .from('brand_campaigns')
        .insert({
          created_by: user.id,
          brand_name: brandName,
          campaign_title: formData.campaign_title,
          campaign_description: formData.campaign_description,
          campaign_type: formData.campaign_type,
          target_destination: formData.target_destination || '',
          deliverables_count: formData.deliverables_count || 1,
          deliverables: [],
          compensation_type: isAffiliate ? 'affiliate' : isGifted ? 'product' : 'paid',
          affiliate_enabled: isAffiliate ? true : false,
          affiliate_percentage: isAffiliate ? (formData.affiliate_percentage || 10) : null,
          required_niches: formData.creator_niche || [],
          min_followers: formData.min_followers ? parseInt(formData.min_followers) : 0,
          creators_needed: formData.creators_needed || 1,
          geo_focus: formData.geo_focus || '',
          requirements: isGifted && formData.product_description
            ? `${formData.requirements || ''}\n\nProduct/Gift: ${formData.product_description}`.trim()
            : formData.requirements || '',
          total_budget: totalBudgetCents,
          platform_fee: platformFeeCents,
          creator_payout: creatorPayoutCents,
          budget_min: (isGifted || isAffiliate) ? 0 : totalBudgetCents,
          spots_available: formData.creators_needed || 1,
          status: 'pending',
          payment_status: 'paid',
          timeline_start: formData.start_date?.toISOString() || null,
          timeline_end: formData.end_date?.toISOString() || null,
          campaign_subject_type: formData.campaign_subject_type || 'platform_brand',
          property_id: formData.campaign_subject_type === 'property_stay' ? formData.property_id : null,
        });

      if (error) throw error;

      toast({
        title: "Campaign created!",
        description: "Your campaign has been successfully submitted.",
      });
      navigate('/campaigns/confirmation');
    } catch (err: any) {
      console.error('Campaign creation error:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {step} of {totalSteps}</span>
          <span>{["Campaign Details", "Creator Targeting", "Budget & Pricing", "Review & Pay"][step - 1]}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Compensation Type Selector */}
            <div className="space-y-2">
              <Label>Campaign Compensation Type *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => updateField("compensation_type", "paid")}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-lg border-2 p-4 text-left transition-all",
                    formData.compensation_type === "paid"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">Paid</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pay creators directly. 20% platform fee.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => updateField("compensation_type", "gifted")}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-lg border-2 p-4 text-left transition-all",
                    formData.compensation_type === "gifted"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">Gifted</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gift product directly to creators.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => updateField("compensation_type", "affiliate")}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-lg border-2 p-4 text-left transition-all",
                    formData.compensation_type === "affiliate"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">Affiliate</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Commission-based earning for creators.
                  </p>
                </button>
              </div>
            </div>
            {/* Campaign Subject Type */}
<div className="space-y-2">
  <Label>What is this campaign for? *</Label>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

    <button
      type="button"
      onClick={() => {
        updateField("campaign_subject_type", "platform_brand");
      
        updateField("property_id", "");
      }}
      className={cn(
        "flex flex-col items-start gap-1.5 rounded-lg border-2 p-4 text-left transition-all",
        formData.campaign_subject_type === "platform_brand"
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40"
      )}
    >
      <span className="font-semibold text-foreground">Platform Brand</span>
      <p className="text-xs text-muted-foreground">
        A brand registered on Hostfluencer
      </p>
    </button>

    <button
      type="button"
      onClick={() => {
        updateField("campaign_subject_type", "property_stay");
      
        updateField("property_id", "");
      }}
      className={cn(
        "flex flex-col items-start gap-1.5 rounded-lg border-2 p-4 text-left transition-all",
        formData.campaign_subject_type === "property_stay"
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40"
      )}
    >
      <span className="font-semibold text-foreground">Property Stay</span>
      <p className="text-xs text-muted-foreground">
        A hotel, Airbnb, or venue listing
      </p>
    </button>

  </div>
</div>

{formData.campaign_subject_type === "property_stay" && (
  <div className="space-y-2">
    <Label htmlFor="property_id">Select Property *</Label>

    <Select
      value={formData.property_id}
      onValueChange={(value) => updateField("property_id", value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Choose a property" />
      </SelectTrigger>

      <SelectContent>
        {properties.map((property) => (
          <SelectItem key={property.id} value={property.id}>
            {property.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}
            <div className="space-y-2">
              <Label htmlFor="campaign_title">Campaign Name *</Label>
              <Input id="campaign_title" placeholder="e.g. Summer Beach Resort Promotion" value={formData.campaign_title} onChange={e => updateField("campaign_title", e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign_description">Campaign Description *</Label>
              <Textarea id="campaign_description" placeholder="What should creators do/post? Describe your campaign goals..." value={formData.campaign_description} onChange={e => updateField("campaign_description", e.target.value)} rows={4} maxLength={1000} />
            </div>
            <div className="space-y-2">
              <Label>Campaign Type *</Label>
              <Select value={formData.campaign_type} onValueChange={v => updateField("campaign_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select campaign type" /></SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_destination">Target Destination or Property</Label>
              <Input id="target_destination" placeholder='e.g. "Miami Beach Hotels", "NYC Restaurants"' value={formData.target_destination} onChange={e => updateField("target_destination", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliverables_count">Content Deliverables (number of pieces)</Label>
              <Input id="deliverables_count" type="number" min={1} max={100} value={formData.deliverables_count} onChange={e => updateField("deliverables_count", parseInt(e.target.value) || 1)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.start_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.start_date} onSelect={d => updateField("start_date", d)} initialFocus /></PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.end_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? format(formData.end_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.end_date} onSelect={d => updateField("end_date", d)} initialFocus /></PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Creator Targeting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Creator Niche *</Label>
              <div className="flex flex-wrap gap-2">
                {NICHES.map(niche => (
                  <Button key={niche} type="button" size="sm" variant={formData.creator_niche.includes(niche) ? "default" : "outline"} onClick={() => toggleNiche(niche)}>
                    {niche}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Minimum Follower Count</Label>
              <Select value={formData.min_followers} onValueChange={v => updateField("min_followers", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FOLLOWER_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="creators_needed">Number of Creators Needed</Label>
              <Input id="creators_needed" type="number" min={1} max={100} value={formData.creators_needed} onChange={e => updateField("creators_needed", parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="geo_focus">Geographic Focus (optional)</Label>
              <Input id="geo_focus" placeholder='e.g. "US-based creators only"' value={formData.geo_focus} onChange={e => updateField("geo_focus", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Additional Requirements (optional)</Label>
              <Textarea id="requirements" placeholder="Any specific requirements for creators..." value={formData.requirements} onChange={e => updateField("requirements", e.target.value)} rows={3} maxLength={1000} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{isGifted ? "Gifted Campaign" : isAffiliate ? "Affiliate Campaign" : "Budget & Pricing"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {isAffiliate ? (
                <>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Link className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">Subscription Campaign</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Creators earn commission on sales through their unique affiliate links. 
                      Listing this campaign is fully covered under your active subscription plan.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliate_percentage">Commission Percentage *</Label>
                    <div className="relative">
                       <Input
                         id="affiliate_percentage"
                         type="number"
                         min={1}
                         max={50}
                         step={1}
                         value={formData.affiliate_percentage}
                         onChange={e => updateField("affiliate_percentage", Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                         className="pr-8"
                       />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Percentage of each sale creators will earn (1-50%)</p>
                  </div>
                </>
              ) : isGifted ? (
                <>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">Subscription Campaign</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Instead of a cash budget, you'll gift your product directly to matched creators. 
                      Listing this campaign is fully covered under your active subscription plan.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_description">Product/Gift Description *</Label>
                    <Textarea
                      id="product_description"
                      placeholder="Describe what you'll be gifting to creators (e.g. 3-night hotel stay, product bundle worth $500, etc.)"
                      value={formData.product_description}
                      onChange={e => updateField("product_description", e.target.value)}
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="total_budget">Total Campaign Budget (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="total_budget" type="number" min={500} step={50} className="pl-7" value={formData.total_budget} onChange={e => updateField("total_budget", Math.max(0, parseFloat(e.target.value) || 0))} />
                  </div>
                  {formData.total_budget < 500 && formData.total_budget > 0 && (
                    <p className="text-sm text-destructive">Minimum campaign budget is $500</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="lg:col-span-2 lg:sticky lg:top-6 self-start">
            <PricingBreakdownCard totalBudget={isGifted || isAffiliate ? 200 : formData.total_budget} isGifted={isGifted || isAffiliate} />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <CampaignReviewStep formData={formData} />
          </div>
          <div className="lg:col-span-2 lg:sticky lg:top-6 self-start">
            <PricingBreakdownCard totalBudget={isGifted || isAffiliate ? 200 : formData.total_budget} isGifted={isGifted || isAffiliate} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {step < totalSteps ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button variant="premium" onClick={handleSubmit} disabled={loading || !canProceed()}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Submit Campaign"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CampaignCreateForm;
