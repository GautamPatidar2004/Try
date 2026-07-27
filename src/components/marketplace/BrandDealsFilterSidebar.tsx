import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Target, X, Sparkles } from 'lucide-react';
import { CampaignFilters } from '@/hooks/useBrandCampaigns';
import { useCampaignFilterOptions, getPlatformConfig, compensationTypeConfig } from '@/hooks/useCampaignFilterOptions';
import { cn } from '@/lib/utils';

interface BrandDealsFilterSidebarProps {
  filters: CampaignFilters;
  onFiltersChange: (filters: CampaignFilters) => void;
  onClearAll: () => void;
}

export const BrandDealsFilterSidebar = ({
  filters,
  onFiltersChange,
  onClearAll,
}: BrandDealsFilterSidebarProps) => {
  const { data: filterOptions, isLoading } = useCampaignFilterOptions();

  const handleCompensationToggle = (type: string) => {
    const current = filters.compensation_type || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, compensation_type: updated });
  };

  const handlePlatformToggle = (platform: string) => {
    const current = filters.platforms || [];
    const updated = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    onFiltersChange({ ...filters, platforms: updated });
  };

  const handleNicheToggle = (niche: string) => {
    const current = filters.niches || [];
    const updated = current.includes(niche)
      ? current.filter((n) => n !== niche)
      : [...current, niche];
    onFiltersChange({ ...filters, niches: updated });
  };

  const handleDeliverableToggle = (deliverable: string) => {
    const current = filters.deliverables || [];
    const updated = current.includes(deliverable)
      ? current.filter((d) => d !== deliverable)
      : [...current, deliverable];
    onFiltersChange({ ...filters, deliverables: updated });
  };

  const activeFiltersCount =
    (filters.compensation_type?.length || 0) +
    (filters.platforms?.length || 0) +
    (filters.niches?.length || 0) +
    (filters.deliverables?.length || 0) +
    (filters.has_open_spots ? 1 : 0) +
    (filters.deadline_within_days ? 1 : 0);

  const platforms = filterOptions?.platforms || [];
  const niches = filterOptions?.niches || [];
  const deliverables = filterOptions?.deliverables || [];
  const budgetRange = filterOptions?.budgetRange || { min: 0, max: 10000 };

  return (
    <div className="flex flex-col h-full">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-t-lg border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Filters</h3>
              <p className="text-xs text-muted-foreground">Refine your search</p>
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-destructive hover:text-destructive">
              <X className="w-4 h-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Compensation Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Compensation Type</Label>
            <div className="flex flex-wrap gap-2">
              {compensationTypeConfig.map((type) => {
                const isSelected = filters.compensation_type?.includes(type.value);
                return (
                  <Button
                    key={type.value}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCompensationToggle(type.value)}
                    className={cn(
                      'transition-all',
                      isSelected && `bg-gradient-to-r ${type.color} border-0`
                    )}
                  >
                    <span className="mr-1">{type.icon}</span>
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Budget Range - Show for paid/hybrid */}
          {(filters.compensation_type?.includes('paid') || filters.compensation_type?.includes('hybrid')) && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Budget Range: ${filters.budget_min || budgetRange.min} - ${filters.budget_max || budgetRange.max}
                </Label>
                <Slider
                  min={budgetRange.min}
                  max={budgetRange.max}
                  step={100}
                  value={[filters.budget_min || budgetRange.min, filters.budget_max || budgetRange.max]}
                  onValueChange={([min, max]) =>
                    onFiltersChange({ ...filters, budget_min: min, budget_max: max })
                  }
                  className="w-full"
                />
              </div>
              <Separator />
            </>
          )}

          {/* Quick Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Filters</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="open-spots" className="text-sm cursor-pointer">
                  Only campaigns with open spots
                </Label>
                <Switch
                  id="open-spots"
                  checked={filters.has_open_spots || false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ ...filters, has_open_spots: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="deadline-soon" className="text-sm cursor-pointer">
                  Deadline within 7 days
                </Label>
                <Switch
                  id="deadline-soon"
                  checked={filters.deadline_within_days === 7}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ ...filters, deadline_within_days: checked ? 7 : undefined })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Platforms */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Platforms</Label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : platforms.length > 0 ? (
              <div className="space-y-2">
                {platforms.map((platform) => {
                  const config = getPlatformConfig(platform);
                  return (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform}
                        checked={filters.platforms?.includes(platform)}
                        onCheckedChange={() => handlePlatformToggle(platform)}
                      />
                      <Label
                        htmlFor={platform}
                        className="text-sm cursor-pointer flex-1 flex items-center gap-2"
                      >
                        <span>{config.icon}</span>
                        {config.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No platforms available</div>
            )}
          </div>

          <Separator />

          {/* Content Types / Deliverables */}
          {deliverables.length > 0 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Content Types</Label>
                <div className="flex flex-wrap gap-2">
                  {deliverables.slice(0, 10).map((deliverable) => (
                    <Badge
                      key={deliverable}
                      variant={filters.deliverables?.includes(deliverable) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => handleDeliverableToggle(deliverable)}
                    >
                      {deliverable}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Niches */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Content Niches</Label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : niches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {niches.map((niche) => (
                  <Badge
                    key={niche}
                    variant={filters.niches?.includes(niche) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/80 transition-colors capitalize"
                    onClick={() => handleNicheToggle(niche)}
                  >
                    {niche}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No niches available</div>
            )}
          </div>

          <Separator />

          {/* Follower Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Your Follower Count: {(filters.min_followers || 0).toLocaleString()}+
            </Label>
            <p className="text-xs text-muted-foreground">
              Show campaigns you qualify for
            </p>
            <Slider
              min={0}
              max={100000}
              step={1000}
              value={[filters.min_followers || 0]}
              onValueChange={([value]) =>
                onFiltersChange({ ...filters, min_followers: value })
              }
              className="w-full"
            />
          </div>
        </div>
      </ScrollArea>

      {/* Footer with AI hint */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Filters update in real-time</span>
        </div>
      </div>
    </div>
  );
};
