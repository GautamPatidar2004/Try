import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateBrandCampaign } from "@/hooks/useBrandCampaignMutations";
import { Upload, X, CalendarIcon,Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AdminCreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NICHE_OPTIONS = ["Travel", "Food", "Lifestyle", "Fashion", "Tech", "Beauty", "Fitness", "Gaming", "Music", "Photography", "Wellness", "Parenting", "Finance", "Education", "Sports"];
const PLATFORM_OPTIONS = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook", "LinkedIn", "Pinterest", "Snapchat"];
const DELIVERABLE_OPTIONS = ["1 Reel", "2 Reels", "1 Story Set", "2 Story Sets", "1 Feed Post", "2 Feed Posts", "1 TikTok Video", "1 YouTube Video", "Blog Post", "UGC Content"];
const FOLLOWER_RANGES = [
  { label: "Any", value: 0 },
  { label: "1K+", value: 1000 },
  { label: "5K+", value: 5000 },
  { label: "10K+", value: 10000 },
  { label: "25K+", value: 25000 },
  { label: "50K+", value: 50000 },
  { label: "100K+", value: 100000 },
];

const ChipSelector = ({ options, selected, onToggle, label }: { options: string[]; selected: string[]; onToggle: (v: string) => void; label: string }) => (
  <div className="grid gap-1.5">
    <Label>{label}</Label>
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <Badge
          key={opt}
          variant={selected.includes(opt) ? "default" : "outline"}
          className="cursor-pointer select-none"
          onClick={() => onToggle(opt)}
        >
          {opt}
        </Badge>
      ))}
    </div>
  </div>
);

const DatePickerField = ({ label, date, onSelect }: { label: string; date?: Date; onSelect: (d?: Date) => void }) => (
  <div className="grid gap-1.5">
    <Label>{label}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={(d) => onSelect(d || undefined)} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  </div>
);

export const AdminCreateCampaignModal = ({ open, onOpenChange }: AdminCreateCampaignModalProps) => {
  const createCampaign = useCreateBrandCampaign();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    campaign_title: "",
    campaign_description: "",
    campaign_type: "",
    campaign_brief_url: "",
    target_destination: "",
    brand_name: "",
    brand_website: "",
    brand_description: "",
    compensation_type: "paid" as "paid" | "product" | "hybrid" | "affiliate",
    budget_min: "",
    budget_max: "",
    product_value: "",
    currency: "EUR",
    min_followers: 0,
    max_followers: "",
    min_engagement_rate: "",
    required_niches: [] as string[],
    required_platforms: [] as string[],
    deliverables: [] as string[],
    content_requirements: [] as string[],
    geo_focus: "",
    requirements: "",
    affiliate_enabled: false,
    affiliate_percentage: "",
    timeline_start: undefined as Date | undefined,
    timeline_end: undefined as Date | undefined,
    application_deadline: undefined as Date | undefined,
    spots_available: "5",
    visibility: "public" as "public" | "private",
    status: "open" as "draft" | "open",
    platform_source: "hostfluencer" as "hostfluencer" | "hostfluencerx",
    hf_subject_type: "platform_brand" as "platform_brand" | "property_stay",
    hf_property_id: "",
    hfx_brand_id: "",
    hfx_brand_name: "",
  });
  const [hfxBrands, setHfxBrands] = useState<{ id: string; name: string }[]>([]);
  const [hfxLoading, setHfxLoading] = useState(false);
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([]);
  
  // Fetch HF properties on mount
  useEffect(() => {
    supabase.from("properties").select("id, title").then(({ data }) => {
      if (data) setProperties(data);
    });
  }, []);
  
  // Fetch HFX brands when user switches to hostfluencerx
  const fetchHFXBrands = async () => {
    setHfxLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-hfx-brands");
      if (!error && data?.brands) setHfxBrands(data.brands);
    } finally {
      setHfxLoading(false);
    }
  };
  const update = (field: string, value: any) => {
    if (field === 'compensation_type' && value === 'affiliate') {
      setForm(prev => ({ ...prev, [field]: value, affiliate_enabled: true }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleChip = (field: "required_niches" | "required_platforms" | "deliverables" | "content_requirements", value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((v: string) => v !== value) : [...prev[field], value],
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => { setImageFile(null); setImagePreview(null); };

  const handleSubmit = async () => {
    if (!form.campaign_title || !form.brand_name || !form.campaign_description) {
      toast({ title: "Missing fields", description: "Title, brand name, and description are required.", variant: "destructive" });
      return;
    }

    setUploading(true);
    let campaign_image_url: string | undefined;

    try {
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `admin-campaigns/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("campaign-images").upload(path, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("campaign-images").getPublicUrl(path);
        campaign_image_url = urlData.publicUrl;
      }

      await createCampaign.mutateAsync({
        campaign_title: form.campaign_title,
        campaign_description: form.campaign_description,
        campaign_type: form.campaign_type || undefined,
        campaign_brief_url: form.campaign_brief_url || undefined,
        campaign_image_url,
        target_destination: form.target_destination || undefined,
        brand_name: form.brand_name,
        brand_website: form.brand_website || undefined,
        brand_description: form.brand_description || undefined,
        compensation_type: form.compensation_type,
        budget_min: form.budget_min ? Number(form.budget_min) : undefined,
        budget_max: form.budget_max ? Number(form.budget_max) : undefined,
        product_value: form.product_value ? Number(form.product_value) : undefined,
        currency: form.currency,
        min_followers: form.min_followers,
        max_followers: form.max_followers ? Number(form.max_followers) : undefined,
        min_engagement_rate: form.min_engagement_rate ? Number(form.min_engagement_rate) : undefined,
        required_niches: form.required_niches,
        required_platforms: form.required_platforms,
        deliverables: form.deliverables,
        content_requirements: form.content_requirements,
        geo_focus: form.geo_focus || undefined,
        requirements: form.requirements || undefined,
        affiliate_enabled: form.affiliate_enabled,
        affiliate_percentage: form.affiliate_enabled && form.affiliate_percentage ? Number(form.affiliate_percentage) : undefined,
        timeline_start: form.timeline_start?.toISOString(),
        timeline_end: form.timeline_end?.toISOString(),
        application_deadline: form.application_deadline?.toISOString(),
        spots_available: Number(form.spots_available) || 5,
        visibility: form.visibility,
        status: form.status,
        platform_source: form.platform_source,
       campaign_subject_type: form.platform_source === "hostfluencer"
       ? form.hf_subject_type
       : "platform_brand",
       property_id:
       form.platform_source === "hostfluencer" &&
       form.hf_subject_type === "property_stay" &&
       form.hf_property_id
       ? form.hf_property_id
       : null,
       hfx_brand_id:
       form.platform_source === "hostfluencerx" && form.hfx_brand_id
       ? form.hfx_brand_id
       : null,
       });

      onOpenChange(false);
      resetForm();
    } catch {
      // error handled by mutation
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      campaign_title: "", campaign_description: "", campaign_type: "", campaign_brief_url: "",
      target_destination: "", brand_name: "", brand_website: "", brand_description: "",
      compensation_type: "paid", budget_min: "", budget_max: "", product_value: "", currency: "EUR",
      min_followers: 0, max_followers: "", min_engagement_rate: "",
      required_niches: [], required_platforms: [], deliverables: [], content_requirements: [],
      geo_focus: "", requirements: "", affiliate_enabled: false, affiliate_percentage: "",
      timeline_start: undefined, timeline_end: undefined, application_deadline: undefined,
      spots_available: "5", visibility: "public", status: "open",platform_source: "hostfluencer",
      hf_subject_type: "platform_brand",
      hf_property_id: "",
      hfx_brand_id: "",
      hfx_brand_name: "",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Brand Campaign</DialogTitle>
        </DialogHeader>
       
        <Accordion type="multiple" defaultValue={["brand", "campaign", "compensation", "creators", "deliverables", "affiliate", "timeline",  "platform_source",]} className="space-y-2">
       
         {/* Section 0: Platform Source */}
<AccordionItem value="platform_source">
  <AccordionTrigger className="text-sm font-semibold">
    Platform Source *
  </AccordionTrigger>
  <AccordionContent className="space-y-4 pt-2">

    {/* HostFluencer vs HostFluencerX toggle */}
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => {
          update("platform_source", "hostfluencer");
        
         
          update("hfx_brand_id", "");
          update("hfx_brand_name", "");
        }}
        className={cn(
          "flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-all",
          form.platform_source === "hostfluencer"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40"
        )}
      >
        <span className="font-semibold text-foreground">HostFluencer</span>
        <p className="text-xs text-muted-foreground">
          Brand or Property from HostFluencer platform
        </p>
      </button>

      <button
        type="button"
        onClick={() => {
          update("platform_source", "hostfluencerx");
          update("hf_subject_type", "platform_brand");
          update("hf_property_id", "");
          fetchHFXBrands(); // fetch brands when selected
        }}
        className={cn(
          "flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-all",
          form.platform_source === "hostfluencerx"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40"
        )}
      >
        <span className="font-semibold text-foreground">HostFluencerX</span>
        <p className="text-xs text-muted-foreground">
          Brand from HostFluencerX client database
        </p>
      </button>
    </div>

    {/* If HostFluencer selected → show Brand or Property choice */}
    {form.platform_source === "hostfluencer" && (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              update("hf_subject_type", "platform_brand");
              update("hf_property_id", "");
            }}
            className={cn(
              "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all",
              form.hf_subject_type === "platform_brand"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            )}
          >
            <span className="font-semibold text-sm text-foreground">Platform Brand</span>
            <p className="text-xs text-muted-foreground">A brand registered on HostFluencer</p>
          </button>

          <button
            type="button"
            onClick={() => update("hf_subject_type", "property_stay")}
            className={cn(
              "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all",
              form.hf_subject_type === "property_stay"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            )}
          >
            <span className="font-semibold text-sm text-foreground">Property Stay</span>
            <p className="text-xs text-muted-foreground">A hotel, Airbnb, or venue</p>
          </button>
        </div>

        {/* Property dropdown if property_stay */}
        {form.hf_subject_type === "property_stay" && (
          <div className="grid gap-1.5">
            <Label>Select Property *</Label>
            <Select
              value={form.hf_property_id}
              onValueChange={v => update("hf_property_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    )}

    {/* If HostFluencerX selected → show brand dropdown */}
    {form.platform_source === "hostfluencerx" && (
      <div className="grid gap-1.5">
        <Label>Select HostFluencerX Brand *</Label>
        {hfxLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Fetching brands...
          </div>
        ) : (
          <Select
            value={form.hfx_brand_id}
            onValueChange={v => {
              const brand = hfxBrands.find(b => b.id === v);
              update("hfx_brand_id", v);
              update("hfx_brand_name", brand?.name || "");
              // Also auto-fill brand_name field
              update("brand_name", brand?.name || "");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a brand from HostFluencerX" />
            </SelectTrigger>
            <SelectContent>
              {hfxBrands.map(b => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )}

  </AccordionContent>
</AccordionItem>
          {/* Section 1: Brand Info */}
          <AccordionItem value="brand">
            <AccordionTrigger className="text-sm font-semibold">Brand Info</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="grid gap-1.5">
                <Label>Brand Name *</Label>
                <Input value={form.brand_name} onChange={e => update("brand_name", e.target.value)} placeholder="Acme Co." />
              </div>
              <div className="grid gap-1.5">
                <Label>Brand Website</Label>
                <Input value={form.brand_website} onChange={e => update("brand_website", e.target.value)} placeholder="https://acme.com" />
              </div>
              <div className="grid gap-1.5">
                <Label>Brand Description</Label>
                <Textarea value={form.brand_description} onChange={e => update("brand_description", e.target.value)} placeholder="About the brand..." rows={2} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 2: Campaign Details */}
          <AccordionItem value="campaign">
            <AccordionTrigger className="text-sm font-semibold">Campaign Details</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="grid gap-1.5">
                <Label>Campaign Title *</Label>
                <Input value={form.campaign_title} onChange={e => update("campaign_title", e.target.value)} placeholder="Summer Collection Launch" />
              </div>
              <div className="grid gap-1.5">
                <Label>Description *</Label>
                <Textarea value={form.campaign_description} onChange={e => update("campaign_description", e.target.value)} placeholder="Campaign brief..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Campaign Type</Label>
                  <Select value={form.campaign_type} onValueChange={v => update("campaign_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Target Destination</Label>
                  <Input value={form.target_destination} onChange={e => update("target_destination", e.target.value)} placeholder="e.g. Lisbon, Portugal" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Campaign Brief URL</Label>
                <Input value={form.campaign_brief_url} onChange={e => update("campaign_brief_url", e.target.value)} placeholder="https://..." />
              </div>
              {/* Image */}
              <div className="grid gap-1.5">
                <Label>Campaign Image</Label>
                {imagePreview ? (
                  <div className="relative w-full h-32 rounded-md overflow-hidden">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                    <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={removeImage}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center h-20 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4" /> Upload image
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 3: Compensation & Budget */}
          <AccordionItem value="compensation">
            <AccordionTrigger className="text-sm font-semibold">Compensation & Budget</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Compensation Type</Label>
                  <Select value={form.compensation_type} onValueChange={v => update("compensation_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="product">Product / Gifted</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="affiliate">Affiliate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Currency</Label>
                  <Select value={form.currency} onValueChange={v => update("currency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.compensation_type !== "affiliate" && (
              <div className="grid grid-cols-3 gap-3">
                {(form.compensation_type === "paid" || form.compensation_type === "hybrid") && (
                  <>
                    <div className="grid gap-1.5">
                      <Label>Min Budget</Label>
                      <Input type="number" value={form.budget_min} onChange={e => update("budget_min", e.target.value)} placeholder="100" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Max Budget</Label>
                      <Input type="number" value={form.budget_max} onChange={e => update("budget_max", e.target.value)} placeholder="500" />
                    </div>
                  </>
                )}
                {(form.compensation_type === "product" || form.compensation_type === "hybrid") && (
                  <div className="grid gap-1.5">
                    <Label>Product Value</Label>
                    <Input type="number" value={form.product_value} onChange={e => update("product_value", e.target.value)} placeholder="200" />
                  </div>
                )}
              </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Section 4: Creator Requirements */}
          <AccordionItem value="creators">
            <AccordionTrigger className="text-sm font-semibold">Creator Requirements</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label>Min Followers</Label>
                  <Select value={String(form.min_followers)} onValueChange={v => update("min_followers", Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FOLLOWER_RANGES.map(r => (
                        <SelectItem key={r.value} value={String(r.value)}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Max Followers</Label>
                  <Input type="number" value={form.max_followers} onChange={e => update("max_followers", e.target.value)} placeholder="No limit" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Min Engagement %</Label>
                  <Input type="number" value={form.min_engagement_rate} onChange={e => update("min_engagement_rate", e.target.value)} placeholder="e.g. 3" step="0.1" />
                </div>
              </div>
              <ChipSelector label="Required Niches" options={NICHE_OPTIONS} selected={form.required_niches} onToggle={v => toggleChip("required_niches", v)} />
              <ChipSelector label="Required Platforms" options={PLATFORM_OPTIONS} selected={form.required_platforms} onToggle={v => toggleChip("required_platforms", v)} />
              <div className="grid gap-1.5">
                <Label>Additional Requirements</Label>
                <Textarea value={form.requirements} onChange={e => update("requirements", e.target.value)} placeholder="Any specific requirements..." rows={2} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 5: Deliverables & Content */}
          <AccordionItem value="deliverables">
            <AccordionTrigger className="text-sm font-semibold">Deliverables & Content</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <ChipSelector label="Deliverables" options={DELIVERABLE_OPTIONS} selected={form.deliverables} onToggle={v => toggleChip("deliverables", v)} />
              <div className="grid gap-1.5">
                <Label>Geo Focus</Label>
                <Input value={form.geo_focus} onChange={e => update("geo_focus", e.target.value)} placeholder="e.g. Europe, US East Coast" />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 6: Affiliate Program */}
          <AccordionItem value="affiliate">
            <AccordionTrigger className="text-sm font-semibold">Affiliate Program</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Affiliate Program</Label>
                  <p className="text-xs text-muted-foreground">Offer creators a commission on sales</p>
                </div>
                <Switch checked={form.affiliate_enabled} onCheckedChange={v => update("affiliate_enabled", v)} />
              </div>
              {form.affiliate_enabled && (
                <div className="grid gap-1.5">
                  <Label>Commission Percentage (%)</Label>
                  <Input type="number" min={1} max={50} value={form.affiliate_percentage} onChange={e => update("affiliate_percentage", e.target.value)} placeholder="e.g. 15" />
                  <p className="text-xs text-muted-foreground">Between 1% and 50%</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Section 7: Timeline & Availability */}
          <AccordionItem value="timeline">
            <AccordionTrigger className="text-sm font-semibold">Timeline & Availability</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <DatePickerField label="Timeline Start" date={form.timeline_start} onSelect={d => update("timeline_start", d)} />
                <DatePickerField label="Timeline End" date={form.timeline_end} onSelect={d => update("timeline_end", d)} />
              </div>
              <DatePickerField label="Application Deadline" date={form.application_deadline} onSelect={d => update("application_deadline", d)} />
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label>Spots Available</Label>
                  <Input type="number" value={form.spots_available} onChange={e => update("spots_available", e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Visibility</Label>
                  <Select value={form.visibility} onValueChange={v => update("visibility", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => update("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button className="w-full mt-4" onClick={handleSubmit} disabled={uploading || createCampaign.isPending}>
          {uploading || createCampaign.isPending ? "Creating..." : "Create Campaign"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
