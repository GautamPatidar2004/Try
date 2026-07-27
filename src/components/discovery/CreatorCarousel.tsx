import { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CreatorCarouselCard from './CreatorCarouselCard';
import CreatorCard from '@/components/CreatorCard';

interface Creator {
  id: string;
  name: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  niches?: string[];
  followers?: number;
  engagement_rate?: number;
  instagram_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  match_score?: number;
  match_reasons?: string[];
}

interface CreatorCarouselProps {
  creators: Creator[];
}

const CreatorCarousel = ({ creators }: CreatorCarouselProps) => {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const handleCardClick = (creator: Creator) => {
    setSelectedCreator(creator);
  };

  const handleCloseModal = () => {
    setSelectedCreator(null);
  };

  // Transform creator data to match CreatorCard expected format
  const transformCreatorForCard = (creator: Creator) => {
    return {
      id: creator.id,
      name: creator.name,
      avatar: creator.avatar_url || '',
      location: creator.location || '',
      followers: creator.followers || 0,
      rating: 4.8, // Default rating
      specialties: creator.niches || [],
      instagramUrl: creator.instagram_url,
      youtubeUrl: creator.youtube_url,
      tiktokUrl: creator.tiktok_url,
      matchScore: creator.match_score,
      matchReasons: creator.match_reasons,
      bio: creator.bio,
      engagementRate: creator.engagement_rate,
    };
  };

  return (
    <>
      <div className="w-full py-4">
        <Carousel
          opts={{
            align: "start",
            loop: creators.length > 3,
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {creators.map((creator) => (
              <CarouselItem
                key={creator.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <CreatorCarouselCard
                  creator={creator}
                  onClick={() => handleCardClick(creator)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {creators.length > 3 && (
            <>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </>
          )}
        </Carousel>
      </div>

      {/* Full Profile Modal */}
      <Dialog open={!!selectedCreator} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCreator && (
            <CreatorCard
              creator={transformCreatorForCard(selectedCreator)}
              showMatch={!!selectedCreator.match_score}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatorCarousel;
