import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, Loader2, X, Sparkles } from 'lucide-react';
import { BrandCampaignCard } from './BrandCampaignCard';
import { BrandDealsFilterSidebar } from './BrandDealsFilterSidebar';
import { BrandCampaignDetailModal } from './BrandCampaignDetailModal';
import { BrandCampaignApplicationModal, ApplicationFormData } from './BrandCampaignApplicationModal';
import { useBrandCampaigns, CampaignFilters, BrandCampaign } from '@/hooks/useBrandCampaigns';
import { useSavedCampaigns } from '@/hooks/useSavedCampaigns';
import { useBrandCampaignApplication } from '@/hooks/useBrandCampaignApplication';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { getPlatformConfig, compensationTypeConfig } from '@/hooks/useCampaignFilterOptions';

import { demoBrandCampaigns } from '@/data/demoBrandCampaigns';

interface BrandDealsMarketplaceProps {
  isDemoMode?: boolean;
  initialCampaignId?: string;
  onCloseDeepLink?: () => void;
}

export const BrandDealsMarketplace = ({ isDemoMode = false, initialCampaignId, onCloseDeepLink }: BrandDealsMarketplaceProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CampaignFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<BrandCampaign | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const { data: fetchedCampaigns, isLoading: isFetching } = useBrandCampaigns(
    isDemoMode ? undefined : { ...filters, search: searchQuery }
  );

  const campaigns = isDemoMode ? demoBrandCampaigns : fetchedCampaigns;
  const isLoading = isDemoMode ? false : isFetching;

  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setCurrentUserId(data.session.user.id);
    });
  }, []);

  const { isCampaignSaved, saveCampaign, unsaveCampaign } =
    useSavedCampaigns(currentUserId);

  const { submitApplicationAsync, isSubmitting } = useBrandCampaignApplication();

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handleViewDetails = (campaign: BrandCampaign) => {
    setSelectedCampaign(campaign);
    setIsDetailModalOpen(true);
  };

  // Deep-link: auto-open campaign when arriving via /brand-deals/:campaignId
  const deepLinkOpenedRef = useRef(false);
  useEffect(() => {
    if (!initialCampaignId || isLoading || deepLinkOpenedRef.current) return;
    const match = campaigns?.find((c) => c.id === initialCampaignId);
    if (match) {
      setSelectedCampaign(match);
      setIsDetailModalOpen(true);
      deepLinkOpenedRef.current = true;
    }
  }, [initialCampaignId, isLoading, campaigns]);

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    onCloseDeepLink?.();
  };

  const handleApply = () => {
    if (isDemoMode) {
      navigate('/auth');
      return;
    }
    setIsDetailModalOpen(false);
    setIsApplicationModalOpen(true);
  };

  const handleSubmitApplication = async (data: ApplicationFormData) => {
    if (!selectedCampaign || !currentUserId) {
      if (!currentUserId) toast.error('Please log in to submit an application.');
      return;
    }

    const { data: influencerData } = await supabase
      .from('influencers')
      .select('total_followers, engagement_rate')
      .eq('id', currentUserId)
      .maybeSingle();

    try {
      const result = await submitApplicationAsync({
        campaign_id: selectedCampaign.id,
        influencer_id: currentUserId,
        cover_letter: data.cover_letter,
        proposed_content_ideas: data.proposed_content_ideas,
        portfolio_urls: data.portfolio_urls,
        previous_brand_work: data.previous_brand_work,
        follower_count_snapshot: influencerData?.total_followers || 0,
        engagement_rate_snapshot: influencerData?.engagement_rate || 0,
      });

      const applicationId = result?.id;
      setIsApplicationModalOpen(false);

      // Fire-and-forget: send initial message to campaign owner and navigate
      supabase
        .from('brand_campaigns')
        .select('created_by')
        .eq('id', selectedCampaign.id)
        .single()
        .then(({ data: campaignData }) => {
          const campaignOwnerId = campaignData?.created_by;
          if (campaignOwnerId && data.cover_letter) {
            supabase.from('messages').insert({
              sender_id: currentUserId,
              receiver_id: campaignOwnerId,
              content: `Hi! I've applied to your campaign "${selectedCampaign.campaign_title}".\n\n${data.cover_letter}`,
              application_id: applicationId || null,
            });
          }
          if (campaignOwnerId) {
            navigate(`/profile?tab=messages&conversation=${campaignOwnerId}`);
          }
        });
    } catch {
      // Error toast is handled by the hook
    }
  };

  const removeFilter = (filterType: string, value?: string) => {
    const newFilters = { ...filters };
    
    if (filterType === 'compensation_type' && value) {
      newFilters.compensation_type = filters.compensation_type?.filter(t => t !== value);
    } else if (filterType === 'platforms' && value) {
      newFilters.platforms = filters.platforms?.filter(p => p !== value);
    } else if (filterType === 'niches' && value) {
      newFilters.niches = filters.niches?.filter(n => n !== value);
    } else if (filterType === 'deliverables' && value) {
      newFilters.deliverables = filters.deliverables?.filter(d => d !== value);
    } else if (filterType === 'has_open_spots') {
      newFilters.has_open_spots = undefined;
    } else if (filterType === 'deadline_within_days') {
      newFilters.deadline_within_days = undefined;
    }
    
    setFilters(newFilters);
  };

  const activeFilterBadges = [
    ...(filters.compensation_type?.map(t => ({ type: 'compensation_type', value: t, label: compensationTypeConfig.find(c => c.value === t)?.label || t })) || []),
    ...(filters.platforms?.map(p => ({ type: 'platforms', value: p, label: getPlatformConfig(p).label })) || []),
    ...(filters.niches?.map(n => ({ type: 'niches', value: n, label: n })) || []),
    ...(filters.deliverables?.map(d => ({ type: 'deliverables', value: d, label: d })) || []),
    ...(filters.has_open_spots ? [{ type: 'has_open_spots', value: '', label: 'Open spots' }] : []),
    ...(filters.deadline_within_days ? [{ type: 'deadline_within_days', value: '', label: 'Deadline soon' }] : []),
  ];

  const FiltersContent = (
    <BrandDealsFilterSidebar
      filters={filters}
      onFiltersChange={setFilters}
      onClearAll={handleClearFilters}
    />
  );

  return (
    <div className="flex min-h-screen bg-background pt-[80px]">
      {/* Desktop Filters Sidebar */}
      {!isMobile && (
        <aside className="hidden md:flex md:flex-col w-80 border-r flex-shrink-0 bg-card/30">
          {FiltersContent}
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur-sm border-b">
          <div className="p-6 space-y-4">
            {/* Title Section */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">Brand Deals</h1>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {campaigns?.length || 0} campaigns
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Discover exciting brand partnerships and sponsored campaigns
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns, brands, or niches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-11"
                />
              </div>
              <Button onClick={handleSearch} size="lg">Search</Button>
              
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-11 w-11">
                      <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] p-0">
                    {FiltersContent}
                  </SheetContent>
                </Sheet>
              )}
            </div>

            {/* Active Filters & Sort */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                {activeFilterBadges.map((filter, index) => (
                  <Badge
                    key={`${filter.type}-${filter.value}-${index}`}
                    variant="secondary"
                    className="pl-2 pr-1 py-1 gap-1 hover:bg-secondary/80"
                  >
                    {filter.label}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter(filter.type, filter.value)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                {activeFilterBadges.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-muted-foreground">
                    Clear all
                  </Button>
                )}
              </div>

              <Select
                value={filters.sort_by || 'recent'}
                onValueChange={(value) => setFilters({ ...filters, sort_by: value as CampaignFilters['sort_by'] })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="deadline">Deadline Soon</SelectItem>
                  <SelectItem value="budget_high">Highest Budget</SelectItem>
                  <SelectItem value="spots">Most Spots</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Loading campaigns...</p>
              </div>
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {campaigns.map((campaign) => (
                <BrandCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  isSaved={isCampaignSaved(campaign.id)}
                  onSave={() => saveCampaign(campaign.id)}
                  onUnsave={() => unsaveCampaign(campaign.id)}
                  onViewDetails={() => handleViewDetails(campaign)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <BrandCampaignDetailModal
        campaign={selectedCampaign}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        onApply={handleApply}
        isSaved={selectedCampaign ? isCampaignSaved(selectedCampaign.id) : false}
        onSave={() => selectedCampaign && saveCampaign(selectedCampaign.id)}
        onUnsave={() => selectedCampaign && unsaveCampaign(selectedCampaign.id)}
        isDemoMode={isDemoMode}
      />

      <BrandCampaignApplicationModal
        campaignTitle={selectedCampaign?.campaign_title || ''}
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        onSubmit={handleSubmitApplication}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
