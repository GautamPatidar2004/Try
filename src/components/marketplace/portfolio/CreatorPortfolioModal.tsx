import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { PortfolioHeader } from './PortfolioHeader';
import { PortfolioOverview } from './tabs/PortfolioOverview';
import { PortfolioInstagram } from './tabs/PortfolioInstagram';
import { PortfolioTikTok } from './tabs/PortfolioTikTok';
import { PortfolioReviews } from './tabs/PortfolioReviews';
import { PortfolioContact } from './tabs/PortfolioContact';
import { ContentDetailDrawer } from './shared/ContentDetailDrawer';
import { PortfolioCreator, PortfolioTab } from './types';
import StartConversationModal from '../StartConversationModal';
import { ContentItem } from '@/data/mockPortfolioData';
import { useCreatorPortfolioData } from '@/hooks/useCreatorPortfolioData';

interface CreatorPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: PortfolioCreator;
  isDemoMode?: boolean;
}

export const CreatorPortfolioModal = ({
  isOpen,
  onClose,
  creator,
  isDemoMode = false
}: CreatorPortfolioModalProps) => {
  const [activeTab, setActiveTab] = useState<PortfolioTab>('overview');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Fetch real analytics data
  const {
    instagramMetrics,
    tiktokMetrics,
    audienceData,
    contentGallery,
    hasRealData,
    hasInstagramData,
    hasTikTokData,
    loading,
  } = useCreatorPortfolioData(creator.id);

  const featuredContent = contentGallery.filter(item => item.featured);

  // Create creator with real follower counts from the hook
  const creatorWithRealData = {
    ...creator,
    platforms: {
      ...creator.platforms,
      instagram: creator.platforms.instagram ? {
        ...creator.platforms.instagram,
        followers: instagramMetrics?.followers || creator.platforms.instagram.followers,
      } : undefined,
      tiktok: creator.platforms.tiktok ? {
        ...creator.platforms.tiktok,
        followers: tiktokMetrics?.followers || creator.platforms.tiktok.followers,
      } : undefined,
    }
  };

  const handleContentClick = (content: ContentItem) => {
    setSelectedContent(content);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden flex flex-col">
          <VisuallyHidden.Root>
            <DialogTitle>{creator.name}'s Portfolio</DialogTitle>
          </VisuallyHidden.Root>
          <PortfolioHeader 
            creator={creatorWithRealData} 
            lastUpdated={new Date().toISOString()}
            creatorId={creator.id}
            onMessageClick={() => setShowMessageModal(true)}
            isDemoMode={isDemoMode}
          />
          
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as PortfolioTab)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="instagram" className="data-[state=active]:bg-primary/10">
                  Instagram
                </TabsTrigger>
                <TabsTrigger value="tiktok" className="data-[state=active]:bg-primary/10">
                  TikTok
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-primary/10">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="contact" className="data-[state=active]:bg-primary/10">
                  Contact
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="container max-w-6xl mx-auto p-6">
                <TabsContent value="overview" className="mt-0">
                  <PortfolioOverview
                    creator={creator}
                    instagramMetrics={instagramMetrics}
                    tiktokMetrics={tiktokMetrics}
                    audienceData={audienceData}
                    featuredContent={featuredContent}
                    onContentClick={handleContentClick}
                    hasInstagramData={hasInstagramData}
                    hasTikTokData={hasTikTokData}
                  />
                </TabsContent>

                <TabsContent value="instagram" className="mt-0">
                  <PortfolioInstagram
                    metrics={instagramMetrics}
                    audienceData={audienceData}
                    content={contentGallery}
                    onContentClick={handleContentClick}
                    creatorId={creator.id}
                    hasInstagramData={hasInstagramData}
                  />
                </TabsContent>

                <TabsContent value="tiktok" className="mt-0">
                  <PortfolioTikTok
                    metrics={tiktokMetrics}
                    audienceData={audienceData}
                    content={contentGallery}
                    onContentClick={handleContentClick}
                    creatorId={creator.id}
                    hasTikTokData={hasTikTokData}
                  />
                </TabsContent>

                <TabsContent value="reviews" className="mt-0">
                  <PortfolioReviews creatorId={creator.id} />
                </TabsContent>

                <TabsContent value="contact" className="mt-0">
                  <PortfolioContact
                    creatorName={creator.name}
                    influencerId={creator.id}
                    
                  />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ContentDetailDrawer
        content={selectedContent}
        isOpen={!!selectedContent}
        onClose={() => setSelectedContent(null)}
      />

      <StartConversationModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        creator={{
          id: creator.id,
          name: creator.name,
          avatar: creator.avatar,
          location: creator.location,
          followers: creator.platforms.instagram?.followers || 0,
          rating: 4.8,
          specialties: creator.niches,
          recentWork: [],
          priceRange: '$500-$2000',
          userId: creator.id,
        }}
      />
    </>
  );
};
