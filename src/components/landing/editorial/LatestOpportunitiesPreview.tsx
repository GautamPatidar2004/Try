import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, MapPin, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PillChip, LiveDot } from "./primitives";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { DemoPropertyDetailModal } from "@/components/landing/demo/DemoPropertyDetailModal";
import { DemoBrandDetailModal } from "@/components/landing/demo/DemoBrandDetailModal";
import { DemoPropertyApplicationModal } from "@/components/landing/demo/DemoPropertyApplicationModal";
import { BrandCampaignApplicationModal } from "@/components/marketplace/BrandCampaignApplicationModal";
import { SignupPaywall } from "@/components/landing/demo/SignupPaywall";

type Opportunity = {
  id?: string;
  title: string;
  location: string;
  slots: string;
  tags: string[];
  badge?: string;
  accent?: string;
  imageUrl?: string;
};

type BrandDeal = {
  id?: string;
  campaignTitle: string;
  brandName: string;
  location: string;
  slots: string;
  tags: string[];
  compensationLabel: string;
  accent?: string;
  imageUrl?: string;
  logoUrl?: string;
};

const fallbackProperty: Opportunity = {
  title: "Casa Miramar",
  location: "Tulum, Mexico",
  slots: "3 of 5 spots left",
  tags: ["Beachfront", "Boutique", "Lifestyle"],
  accent: "from-amber-100 to-rose-100",
};

const fallbackBrand: BrandDeal = {
  campaignTitle: "Summer Swimwear Drop",
  brandName: "Solana Swim",
  location: "Global",
  slots: "5 creator spots",
  tags: ["Fashion", "Lifestyle", "Travel"],
  compensationLabel: "Paid",
  accent: "from-sky-100 to-indigo-100",
};

const ACCENTS = [
  "from-amber-100 to-rose-100",
  "from-emerald-100 to-teal-100",
  "from-sky-100 to-indigo-100",
  "from-violet-100 to-pink-100",
];

const formatTag = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const compensationLabel = (type: string | null | undefined) => {
  switch (type) {
    case "paid":
      return "Paid";
    case "product":
      return "Gifted";
    case "affiliate":
      return "Affiliate";
    case "hybrid":
      return "Hybrid";
    default:
      return "Collab";
  }
};

const OpportunityCard = ({ op, onClick }: { op: Opportunity; onClick?: () => void }) => (
  <article
    onClick={onClick}
    className={cn(
      "group rounded-3xl border border-border bg-card overflow-hidden hover:border-brand-green/40 transition-all",
      onClick && "cursor-pointer"
    )}
  >
    <div className={cn("relative h-44 bg-gradient-to-br overflow-hidden", op.accent)}>
      {op.imageUrl && (
        <img
          src={op.imageUrl}
          alt={op.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      )}
      {op.badge && (
        <div className="absolute top-4 left-4 z-10">
          <PillChip variant="dark" className="text-[10px] tracking-widest font-semibold">
            {op.badge}
          </PillChip>
        </div>
      )}
    </div>
    <div className="p-5">
      <h3 className="font-serif text-xl text-foreground mb-2 line-clamp-1">{op.title}</h3>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
        <MapPin className="w-3.5 h-3.5" />
        <span className="line-clamp-1">{op.location}</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-brand-green font-medium mb-4">
        <Users className="w-3.5 h-3.5" />
        {op.slots}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {op.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  </article>
);

const BrandCard = ({ deal, onClick }: { deal: BrandDeal; onClick?: () => void }) => (
  <article
    onClick={onClick}
    className={cn(
      "group rounded-3xl border border-border bg-card overflow-hidden hover:border-brand-green/40 transition-all",
      onClick && "cursor-pointer"
    )}
  >
    <div className={cn("relative h-44 bg-gradient-to-br overflow-hidden", deal.accent)}>
      {deal.imageUrl ? (
        <img
          src={deal.imageUrl}
          alt={deal.campaignTitle}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : deal.logoUrl ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={deal.logoUrl}
            alt={deal.brandName}
            loading="lazy"
            className="max-h-20 max-w-[60%] object-contain"
          />
        </div>
      ) : null}
      <div className="absolute top-4 left-4 z-10">
        <PillChip variant="dark" className="text-[10px] tracking-widest font-semibold">
          <Sparkles className="w-3 h-3 mr-1" />
          BRAND DEAL
        </PillChip>
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-serif text-xl text-foreground mb-2 line-clamp-1">
        {deal.campaignTitle}
      </h3>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
        <MapPin className="w-3.5 h-3.5" />
        <span className="line-clamp-1">
          {deal.brandName}
          {deal.location ? ` · ${deal.location}` : ""}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-brand-green font-medium mb-4">
        <Users className="w-3.5 h-3.5" />
        {deal.slots}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="px-2.5 py-1 rounded-full bg-brand-green/10 text-xs text-brand-green font-medium">
          {deal.compensationLabel}
        </span>
        {deal.tags.slice(0, 2).map((t) => (
          <span
            key={t}
            className="px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  </article>
);

const SkeletonCard = () => (
  <article className="rounded-3xl border border-border bg-card overflow-hidden">
    <div className="h-44 bg-muted animate-pulse" />
    <div className="p-5 space-y-2">
      <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
      <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
      <div className="flex gap-1.5 pt-2">
        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
      </div>
    </div>
  </article>
);

const LockedCard = () => (
  <article className="relative rounded-3xl border border-border bg-card overflow-hidden">
    <div className="h-44 bg-gradient-to-br from-muted to-muted/40 blur-[2px]" />
    <div className="p-5 blur-[2px] select-none pointer-events-none">
      <div className="h-5 w-2/3 bg-muted rounded mb-2" />
      <div className="h-3 w-1/2 bg-muted rounded mb-1" />
      <div className="h-3 w-1/3 bg-muted rounded mb-4" />
      <div className="flex gap-1.5">
        <div className="h-5 w-16 bg-muted rounded-full" />
        <div className="h-5 w-16 bg-muted rounded-full" />
      </div>
    </div>
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm">
      <div className="h-12 w-12 rounded-full bg-foreground/90 flex items-center justify-center mb-3">
        <Lock className="w-5 h-5 text-background" />
      </div>
      <p className="text-sm font-medium text-foreground">Subscribe to unlock</p>
    </div>
  </article>
);

const ROTATION_MS = 10 * 60 * 1000;

export const LatestOpportunitiesPreview = () => {
  const navigate = useNavigate();
  const [propertyPool, setPropertyPool] = useState<Opportunity[]>([]);
  const [brandPool, setBrandPool] = useState<BrandDeal[]>([]);
  const [propCount, setPropCount] = useState(0);
  const [brandCount, setBrandCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [slot, setSlot] = useState(() => Math.floor(Date.now() / ROTATION_MS));

  useEffect(() => {
    const id = setInterval(() => {
      setSlot(Math.floor(Date.now() / ROTATION_MS));
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [propsRes, propCountRes, brandsRes, brandCountRes] = await Promise.all([
          supabase
            .from("properties")
            .select(
              "id, title, location, max_guests, created_at, property_type, amenities, property_images(image_url, is_primary, display_order)"
            )
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(12),
          supabase
            .from("properties")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true),
          supabase
            .from("brand_campaigns")
            .select(
              "id, brand_name, campaign_title, campaign_image_url, brand_logo_url, target_destination, geo_focus, spots_available, spots_filled, required_niches, compensation_type, affiliate_enabled, budget_min, budget_max, created_at"
            )
            .eq("status", "open")
            .order("created_at", { ascending: false })
            .limit(12),
          supabase
            .from("brand_campaigns")
            .select("*", { count: "exact", head: true })
            .eq("status", "open"),
        ]);

        if (cancelled) return;

        const now = Date.now();
        const propRows = propsRes.data || [];
        const mappedProps: Opportunity[] = propRows.map((p: any, idx: number) => {
          const imgs = (p.property_images || []).slice().sort((a: any, b: any) => {
            if (a.is_primary) return -1;
            if (b.is_primary) return 1;
            return (a.display_order || 0) - (b.display_order || 0);
          });
          const isNew =
            p.created_at && now - new Date(p.created_at).getTime() < 24 * 60 * 60 * 1000;
          const tagSource: string[] = [
            p.property_type ? formatTag(p.property_type) : "",
            ...((p.amenities || []) as string[]).slice(0, 2).map(formatTag),
          ].filter(Boolean);
          return {
            id: p.id,
            title: p.title,
            location: p.location,
            slots: p.max_guests ? `${p.max_guests} spots open` : "Spots open",
            tags: tagSource.length ? tagSource : ["Stay", "Collab"],
            badge: isNew ? "NEW TODAY" : undefined,
            accent: ACCENTS[idx % ACCENTS.length],
            imageUrl: imgs[0]?.image_url,
          };
        });

        const brandRows = brandsRes.data || [];
        const mappedBrands: BrandDeal[] = brandRows.map((b: any, idx: number) => {
          const effectiveType =
            b.compensation_type === "paid" &&
            b.affiliate_enabled &&
            (!b.budget_min || b.budget_min === 0) &&
            (!b.budget_max || b.budget_max === 0)
              ? "affiliate"
              : b.compensation_type;
          const remaining = Math.max(
            (b.spots_available ?? 0) - (b.spots_filled ?? 0),
            0
          );
          return {
            id: b.id,
            campaignTitle: b.campaign_title,
            brandName: b.brand_name,
            location: b.target_destination || b.geo_focus || "",
            slots: remaining > 0 ? `${remaining} creator spots` : "Open to creators",
            tags: ((b.required_niches || []) as string[]).slice(0, 3).map(formatTag),
            compensationLabel: compensationLabel(effectiveType),
            accent: ACCENTS[(idx + 2) % ACCENTS.length],
            imageUrl: b.campaign_image_url || undefined,
            logoUrl: b.brand_logo_url || undefined,
          };
        });

        setPropertyPool(mappedProps);
        setBrandPool(mappedBrands);
        setPropCount(propCountRes.count ?? mappedProps.length);
        setBrandCount(brandCountRes.count ?? mappedBrands.length);
      } catch (e) {
        console.error("Error loading latest opportunities", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const property =
    propertyPool.length > 0 ? propertyPool[slot % propertyPool.length] : fallbackProperty;
  const brand =
    brandPool.length > 0 ? brandPool[slot % brandPool.length] : fallbackBrand;

  const total = Math.max(propCount + brandCount, 2);

  const [propertyDetailOpen, setPropertyDetailOpen] = useState(false);
  const [brandDetailOpen, setBrandDetailOpen] = useState(false);
  const [propertyApplyOpen, setPropertyApplyOpen] = useState(false);
  const [brandApplyOpen, setBrandApplyOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallContext, setPaywallContext] = useState<{ propertyName?: string; hostName?: string }>({});

  const handlePropertySubmit = () => {
    setPropertyApplyOpen(false);
    setPaywallContext({ propertyName: property.title, hostName: "the host" });
    setPaywallOpen(true);
  };

  const handleBrandSubmit = () => {
    setBrandApplyOpen(false);
    setPaywallContext({ propertyName: brand.campaignTitle, hostName: brand.brandName });
    setPaywallOpen(true);
  };

  return (
    <section className="bg-background py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Latest Opportunities
            </span>
            <PillChip variant="mint" className="text-[10px]">
              <LiveDot />
              Live
            </PillChip>
          </div>
          <button
            onClick={() => navigate("/marketplace")}
            className="hidden md:inline-flex items-center gap-1 text-sm text-foreground hover:text-brand-green transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <OpportunityCard op={property} onClick={() => setPropertyDetailOpen(true)} />
              <BrandCard deal={brand} onClick={() => setBrandDetailOpen(true)} />
            </>
          )}
          <LockedCard />
          <LockedCard />
        </div>

        <div className="mt-8 rounded-3xl bg-brand-green/10 border border-brand-green/20 p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="font-serif text-xl text-foreground mb-1">
              You're seeing 2 of {total} opportunities
            </p>
            <p className="text-sm text-muted-foreground">
              Subscribe to unlock the full feed and apply before spots fill up.
            </p>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-11 px-6 font-medium whitespace-nowrap"
          >
            Unlock full access
            <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </div>

      <DemoPropertyDetailModal
        isOpen={propertyDetailOpen}
        onClose={() => setPropertyDetailOpen(false)}
        property={property}
        onApply={() => {
          setPropertyDetailOpen(false);
          setPropertyApplyOpen(true);
        }}
      />

      <DemoBrandDetailModal
        isOpen={brandDetailOpen}
        onClose={() => setBrandDetailOpen(false)}
        brand={brand}
        onApply={() => {
          setBrandDetailOpen(false);
          setBrandApplyOpen(true);
        }}
      />

      <DemoPropertyApplicationModal
        isOpen={propertyApplyOpen}
        onClose={() => setPropertyApplyOpen(false)}
        propertyTitle={property.title}
        onSubmit={handlePropertySubmit}
      />

      <BrandCampaignApplicationModal
        isOpen={brandApplyOpen}
        onClose={() => setBrandApplyOpen(false)}
        campaignTitle={brand.campaignTitle}
        onSubmit={handleBrandSubmit}
      />

      <SignupPaywall
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        userType="creator"
        context={paywallContext}
      />
    </section>
  );
};
