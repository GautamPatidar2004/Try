import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, QrCode, Users, Building2, Briefcase, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMMISSION_RATES, ReferralType } from "@/hooks/useAmbassadorReferrals";
import { BrandCard } from "@/components/ui/brand-card";
import { SITE_CONFIG } from "@/config/site";
interface ReferralLinkGeneratorProps {
  referralLink: string;
}

const LINK_SEGMENTS = [
  { 
    key: 'creator' as ReferralType, 
    label: 'Creators', 
    shortLabel: 'Creators',
    icon: Users,
    path: '/for-creators',
    cta: 'Share with influencers'
  },
  { 
    key: 'property_owner' as ReferralType, 
    label: 'Properties', 
    shortLabel: 'Props',
    icon: Building2,
    path: '/for-hosts',
    cta: 'Share with hotels & hosts'
  },
  { 
    key: 'brand' as ReferralType, 
    label: 'Brands', 
    shortLabel: 'Brands',
    icon: Briefcase,
    path: '/for-brands',
    cta: 'Share with brands'
  },
  { 
    key: 'restaurant' as ReferralType, 
    label: 'Restaurants', 
    shortLabel: 'Rest.',
    icon: UtensilsCrossed,
    path: '/for-brands',
    cta: 'Share with restaurants'
  },
];

export const ReferralLinkGenerator = ({ referralLink }: ReferralLinkGeneratorProps) => {
  const [copied, setCopied] = useState(false);
  const [activeSegment, setActiveSegment] = useState<ReferralType>('creator');
  const { toast } = useToast();

  // Extract referral code from the base link
  const referralCode = referralLink.split('ref=')[1] || '';

  // Generate segment-specific link using production URL
  const getSegmentLink = (segment: ReferralType) => {
    const segmentConfig = LINK_SEGMENTS.find(s => s.key === segment);
    return `${SITE_CONFIG.productionUrl}${segmentConfig?.path}?ref=${referralCode}&type=${segment}`;
  };

  const currentLink = getSegmentLink(activeSegment);
  const currentSegment = LINK_SEGMENTS.find(s => s.key === activeSegment);
  const commissionInfo = COMMISSION_RATES[activeSegment];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: `${currentSegment?.label} referral link copied to clipboard`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BrandCard variant="glow" className="p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Your Referral Links</h3>
      
      {/* Segment Selector - Mobile friendly grid */}
      <Tabs value={activeSegment} onValueChange={(v) => setActiveSegment(v as ReferralType)}>
        <TabsList className="grid w-full grid-cols-4 mb-4 h-auto p-1 gap-0.5">
          {LINK_SEGMENTS.map((segment) => {
            const Icon = segment.icon;
            return (
              <TabsTrigger 
                key={segment.key} 
                value={segment.key}
                className="flex flex-col items-center gap-0.5 py-1.5 px-1 text-[10px] sm:text-xs min-h-[44px] data-[state=active]:bg-brand-green/10 data-[state=active]:text-brand-green touch-manipulation"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate w-full text-center">{segment.shortLabel}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Commission Info */}
      <div className="bg-brand-blush/50 rounded-lg p-3 mb-4 border border-brand-green/10">
        <p className="text-sm font-medium text-brand-dark">{commissionInfo.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {currentSegment?.cta} to earn commissions
        </p>
      </div>

      {/* Link Input - Touch friendly */}
      <div className="flex gap-2 mb-4">
        <Input 
          value={currentLink} 
          readOnly 
          className="font-mono text-xs sm:text-sm h-11 bg-muted/50" 
        />
        <Button 
          onClick={copyToClipboard} 
          variant="outline" 
          size="icon"
          className="min-w-[44px] min-h-[44px] border-brand-green/30 hover:bg-brand-green/10 touch-manipulation"
        >
          {copied ? <Check className="h-4 w-4 text-brand-green" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {/* QR Code Button */}
      <Button 
        variant="outline" 
        className="w-full min-h-[44px] border-brand-green/30 hover:bg-brand-green/10 touch-manipulation"
      >
        <QrCode className="h-4 w-4 mr-2" />
        Generate QR Code
      </Button>
    </BrandCard>
  );
};
