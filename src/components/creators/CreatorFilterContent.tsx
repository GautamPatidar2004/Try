import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Music,
  Users, 
  TrendingUp, 
  MapPin, 
  HandshakeIcon,
  DollarSign,
  Star,
  ShieldCheck,
  Loader2,
  UserCircle2,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCreatorFilterOptions, categorizeNiches } from "@/hooks/useCreatorFilterOptions";
import { GENERATION_OPTIONS, GENDER_OPTIONS, LIFESTYLE_OPTIONS } from "@/lib/demographics";

interface CreatorFilterOptions {
  followerRange: [number, number];
  engagementRate: [number, number];
  contentNiches: string[];
  platforms: string[];
  location: string;
  collaborationTypes: string[];
  rateRange: [number, number];
  minRating: number;
  verifiedOnly: boolean;
  premiumOnly: boolean;
  generations: string[];
  genders: string[];
  lifestyleTags: string[];
}

interface CreatorFilterContentProps {
  filters: CreatorFilterOptions;
  onFiltersChange: (filters: Partial<CreatorFilterOptions>) => void;
}

// Platform icon mapping
const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <Instagram className="h-4 w-4" />;
    case 'tiktok':
      return <Music className="h-4 w-4" />;
    case 'youtube':
      return <Youtube className="h-4 w-4" />;
    case 'twitter':
    case 'x':
      return <Twitter className="h-4 w-4" />;
    default:
      return <Instagram className="h-4 w-4" />;
  }
};

const formatFollowers = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const CreatorFilterContent = ({ filters, onFiltersChange }: CreatorFilterContentProps) => {
  // Use dynamic filter options from the database
  const { contentNiches, platforms, collaborationTypes, loading } = useCreatorFilterOptions();
  
  // Categorize niches for organized display
  const categorizedNiches = categorizeNiches(contentNiches);

  const handleNicheToggle = (niche: string) => {
    const updated = filters.contentNiches.includes(niche)
      ? filters.contentNiches.filter(n => n !== niche)
      : [...filters.contentNiches, niche];
    onFiltersChange({ contentNiches: updated });
  };

  const handlePlatformToggle = (platform: string) => {
    const updated = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    onFiltersChange({ platforms: updated });
  };

  const handleCollabTypeToggle = (type: string) => {
    const updated = filters.collaborationTypes.includes(type)
      ? filters.collaborationTypes.filter(t => t !== type)
      : [...filters.collaborationTypes, type];
    onFiltersChange({ collaborationTypes: updated });
  };

  const toggleArrayValue = (
    key: 'generations' | 'genders' | 'lifestyleTags',
    value: string,
  ) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ [key]: updated } as Partial<CreatorFilterOptions>);
  };

  // Count active filters per section
  const activeFollowerFilter = filters.followerRange[0] !== 0 || filters.followerRange[1] !== 10000000;
  const activePlatformFilter = filters.platforms.length > 0;
  const activeNicheFilter = filters.contentNiches.length > 0;
  const activeCollabFilter = filters.collaborationTypes.length > 0;
  const activeRateFilter = filters.rateRange[0] !== 0 || filters.rateRange[1] !== 10000;
  const activeLocationFilter = filters.location !== "";
  const activeRatingFilter = filters.minRating !== 0;
  const activeVerificationFilter = filters.verifiedOnly || filters.premiumOnly;

  // Category labels for display
  const categoryLabels: Record<string, string> = {
    popular: '🔥 Popular',
    creative: '🎨 Creative',
    active: '💪 Active',
    tech: '💻 Tech',
    home: '🏠 Home',
    other: '✨ Other'
  };

  return (
    <Accordion 
      type="multiple" 
      defaultValue={["followers", "platforms", "niches", "engagement"]} 
      className="space-y-2"
    >
      {/* Follower Range */}
      <AccordionItem value="followers" className="border rounded-xl px-4 bg-card hover:bg-muted/30 transition-colors">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" />
            <span>Follower Count</span>
            {activeFollowerFilter && (
              <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-xs">1</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 space-y-3">
          <Slider
            min={0}
            max={10000000}
            step={100000}
            value={filters.followerRange}
            onValueChange={(value) => onFiltersChange({ followerRange: value as [number, number] })}
            className="my-4"
          />
          <div className="flex justify-between text-xs font-medium">
            <span className="text-primary">{formatFollowers(filters.followerRange[0])}+</span>
            <span className="text-primary">{formatFollowers(filters.followerRange[1])}</span>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Engagement Rate */}
      <AccordionItem value="engagement" className="border rounded-xl px-4 bg-card hover:bg-muted/30 transition-colors">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Engagement Rate</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 space-y-3">
          <Slider
            min={0}
            max={20}
            step={0.5}
            value={filters.engagementRate}
            onValueChange={(value) => onFiltersChange({ engagementRate: value as [number, number] })}
            className="my-4"
          />
          <div className="flex justify-between text-xs font-medium">
            <span className="text-primary">{filters.engagementRate[0]}%</span>
            <span className="text-primary">{filters.engagementRate[1]}%</span>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Platforms */}
      <AccordionItem value="platforms" className="border rounded-xl px-4 bg-card hover:bg-muted/30 transition-colors">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Instagram className="h-4 w-4 text-primary" />
            <span>Platforms</span>
            {activePlatformFilter && (
              <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-xs">{filters.platforms.length}</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            platforms.map((platform) => (
              <div 
                key={platform} 
                className="flex items-center space-x-3 p-2.5 rounded-md hover:bg-muted/50 transition-colors group cursor-pointer"
                onClick={() => handlePlatformToggle(platform)}
              >
                <Checkbox
                  id={`platform-${platform}`}
                  checked={filters.platforms.includes(platform)}
                  onCheckedChange={() => handlePlatformToggle(platform)}
                />
                <Label 
                  htmlFor={`platform-${platform}`}
                  className="text-sm flex items-center gap-2 cursor-pointer flex-1 group-hover:text-primary transition-colors"
                >
                  <span className="group-hover:scale-110 transition-transform">{getPlatformIcon(platform)}</span>
                  <span className="font-medium">{platform}</span>
                </Label>
              </div>
            ))
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Content Niches */}
      <AccordionItem value="niches" className="border rounded-xl px-4 bg-card hover:bg-muted/30 transition-colors">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Star className="h-4 w-4 text-primary" />
            <span>Content Niches</span>
            {activeNicheFilter && (
              <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-xs">{filters.contentNiches.length}</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <div className="space-y-4 max-h-72 overflow-y-auto pr-2 scrollbar-thin">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              Object.entries(categorizedNiches).map(([category, niches]) => (
                <div key={category} className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
                    {categoryLabels[category] || category}
                  </p>
                  {niches.map((niche) => (
                    <div 
                      key={niche} 
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-pointer"
                      onClick={() => handleNicheToggle(niche)}
                    >
                      <Checkbox
                        id={`niche-${niche}`}
                        checked={filters.contentNiches.includes(niche)}
                        onCheckedChange={() => handleNicheToggle(niche)}
                      />
                      <Label 
                        htmlFor={`niche-${niche}`}
                        className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors"
                      >
                        {niche}
                      </Label>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Collaboration Types */}
      <AccordionItem value="collaboration" className="border rounded-xl px-4 bg-card hover:bg-muted/30 transition-colors">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <HandshakeIcon className="h-4 w-4 text-primary" />
            <span>Collaboration Types</span>
            {activeCollabFilter && (
              <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-xs">{filters.collaborationTypes.length}</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            collaborationTypes.map((type) => (
              <div 
                key={type} 
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-pointer"
                onClick={() => handleCollabTypeToggle(type)}
              >
                <Checkbox
                  id={`collab-${type}`}
                  checked={filters.collaborationTypes.includes(type)}
                  onCheckedChange={() => handleCollabTypeToggle(type)}
                />
                <Label 
                  htmlFor={`collab-${type}`}
                  className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors"
                >
                  {type}
                </Label>
              </div>
            ))
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Rate Range */}
      <AccordionItem value="rate" className="border rounded-xl px-4 bg-card hover:bg-muted/30 transition-colors">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4 text-primary" />
            <span>Rate Range</span>
            {activeRateFilter && (
              <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-xs">1</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 space-y-3">
          <Slider
            min={0}
            max={10000}
            step={100}
            value={filters.rateRange}
            onValueChange={(value) => onFiltersChange({ rateRange: value as [number, number] })}
            className="my-4"
          />
          <div className="flex justify-between text-xs font-medium">
            <span className="text-primary">{formatCurrency(filters.rateRange[0])}</span>
            <span className="text-primary">{formatCurrency(filters.rateRange[1])}</span>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Location */}
      <AccordionItem value="location" className="border rounded-xl px-4 bg-card hover:bg-muted/30 transition-colors">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Location</span>
            {activeLocationFilter && (
              <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-xs">1</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <Input
            id="location"
            placeholder="Enter city or region"
            value={filters.location}
            onChange={(e) => onFiltersChange({ location: e.target.value })}
            className="w-full"
          />
        </AccordionContent>
      </AccordionItem>

      {/* Minimum Rating */}
      <AccordionItem value="rating" className="border rounded-lg px-4 bg-card hover:bg-muted/30 transition-colors">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span>Minimum Rating</span>
            {activeRatingFilter && (
              <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-xs">1</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 space-y-3">
          <Slider
            min={0}
            max={5}
            step={0.5}
            value={[filters.minRating]}
            onValueChange={(value) => onFiltersChange({ minRating: value[0] })}
            className="my-4"
          />
          <div className="text-xs font-medium text-center text-primary">
            {filters.minRating} stars and above
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Verification & Premium */}
      <AccordionItem value="verification" className="border rounded-xl px-4 bg-card hover:bg-muted/30 transition-colors">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Account Status</span>
            {activeVerificationFilter && (
              <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-xs">
                {(filters.verifiedOnly ? 1 : 0) + (filters.premiumOnly ? 1 : 0)}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 space-y-3">
          <div 
            className="flex items-center space-x-3 p-2.5 rounded-md hover:bg-muted/50 transition-colors group cursor-pointer"
            onClick={() => onFiltersChange({ verifiedOnly: !filters.verifiedOnly })}
          >
            <Checkbox
              id="verified"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => onFiltersChange({ verifiedOnly: checked as boolean })}
            />
            <Label htmlFor="verified" className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors">
              Verified creators only
            </Label>
          </div>
          <div 
            className="flex items-center space-x-3 p-2.5 rounded-md hover:bg-muted/50 transition-colors group cursor-pointer"
            onClick={() => onFiltersChange({ premiumOnly: !filters.premiumOnly })}
          >
            <Checkbox
              id="premium"
              checked={filters.premiumOnly}
              onCheckedChange={(checked) => onFiltersChange({ premiumOnly: checked as boolean })}
            />
            <Label htmlFor="premium" className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors">
              Premium creators only
            </Label>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Demographics: Generation & Gender */}
      <AccordionItem value="demographics" className="border rounded-xl px-4 bg-card hover:bg-muted/30 transition-colors">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UserCircle2 className="h-4 w-4 text-primary" />
            <span>Demographics</span>
            {(filters.generations.length + filters.genders.length) > 0 && (
              <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-xs">
                {filters.generations.length + filters.genders.length}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Generation
            </p>
            {GENERATION_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-pointer"
                onClick={() => toggleArrayValue('generations', opt.value)}
              >
                <Checkbox
                  id={`gen-${opt.value}`}
                  checked={filters.generations.includes(opt.value)}
                  onCheckedChange={() => toggleArrayValue('generations', opt.value)}
                />
                <Label
                  htmlFor={`gen-${opt.value}`}
                  className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors flex items-center justify-between"
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.range}</span>
                </Label>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Gender
            </p>
            {GENDER_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-pointer"
                onClick={() => toggleArrayValue('genders', opt.value)}
              >
                <Checkbox
                  id={`gender-${opt.value}`}
                  checked={filters.genders.includes(opt.value)}
                  onCheckedChange={() => toggleArrayValue('genders', opt.value)}
                />
                <Label
                  htmlFor={`gender-${opt.value}`}
                  className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors font-medium"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Lifestyle */}
      <AccordionItem value="lifestyle" className="border rounded-xl px-4 bg-card hover:bg-muted/30 transition-colors">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Heart className="h-4 w-4 text-primary" />
            <span>Lifestyle</span>
            {filters.lifestyleTags.length > 0 && (
              <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-xs">
                {filters.lifestyleTags.length}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 space-y-1.5">
          {LIFESTYLE_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-pointer"
              onClick={() => toggleArrayValue('lifestyleTags', opt.value)}
            >
              <Checkbox
                id={`lifestyle-${opt.value}`}
                checked={filters.lifestyleTags.includes(opt.value)}
                onCheckedChange={() => toggleArrayValue('lifestyleTags', opt.value)}
              />
              <Label
                htmlFor={`lifestyle-${opt.value}`}
                className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors font-medium"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
