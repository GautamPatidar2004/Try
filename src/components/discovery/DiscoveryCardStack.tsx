import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MatchCard from './MatchCard';
import { useToast } from '@/hooks/use-toast';

interface DiscoveryCardStackProps {
  queue: any[];
  userType: 'influencer' | 'host';
  onSwipe: (action: 'like' | 'pass', matchId: string, propertyId: string | null, influencerId: string | null) => Promise<void>;
}

const DiscoveryCardStack = ({ queue, userType, onSwipe }: DiscoveryCardStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const { toast } = useToast();

  const currentCard = queue[currentIndex];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePass();
      if (e.key === 'ArrowRight') handleLike();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, queue]);

  const handleDragEnd = (info: any) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        handleLike();
      } else {
        handlePass();
      }
    }
  };

  const handleLike = async () => {
    if (!currentCard) return;

    setDirection('right');
    
    const matchId = currentCard.id;
    const propertyId = currentCard.property_id;
    const influencerId = currentCard.influencer_id;

    await onSwipe('like', matchId, propertyId, influencerId);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  const handlePass = async () => {
    if (!currentCard) return;

    setDirection('left');

    const matchId = currentCard.id;
    const propertyId = currentCard.property_id;
    const influencerId = currentCard.influencer_id;

    await onSwipe('pass', matchId, propertyId, influencerId);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  if (currentIndex >= queue.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-primary/10 rounded-full p-6 mb-6 floating">
          <Sparkles className="h-20 w-20 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-3 gradient-text">You've seen all matches!</h2>
        <p className="text-muted-foreground text-lg max-w-md">
          Check back later for new AI-powered matches tailored just for you
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full max-w-md mx-auto">
      {/* Card Stack */}
      <div className="relative h-[calc(100%-180px)] md:h-[calc(100%-160px)]">
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: 0,
                x: direction === 'right' ? 400 : direction === 'left' ? -400 : 0,
                rotate: direction === 'right' ? 25 : direction === 'left' ? -25 : 0,
              }}
              exit={{ 
                scale: 0.85, 
                opacity: 0,
                y: 20,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="absolute inset-0"
            >
              <MatchCard
                data={currentCard}
                userType={userType}
                onDragEnd={handleDragEnd}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview of next card */}
        {queue[currentIndex + 1] && (
          <motion.div 
            initial={{ scale: 0.92, opacity: 0.3 }}
            animate={{ scale: 0.94, opacity: 0.5 }}
            className="absolute inset-0 -z-10"
          >
            <MatchCard
              data={queue[currentIndex + 1]}
              userType={userType}
            />
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-8 py-6 bg-gradient-to-t from-background via-background/95 to-transparent pt-12">
        <div className="flex flex-col items-center gap-2">
          <Button
            size="lg"
            variant="outline"
            className="h-16 w-16 rounded-full shadow-lg border-2 hover:scale-110 hover:border-destructive/50 hover:bg-destructive/10 transition-all duration-200"
            onClick={handlePass}
          >
            <X className="h-7 w-7" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground">Pass</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button
            size="lg"
            className="h-20 w-20 rounded-full shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary/90 hover:scale-110 transition-all duration-200 border-2 border-primary/20"
            onClick={handleLike}
          >
            <Heart className="h-9 w-9 fill-primary-foreground text-primary-foreground" />
          </Button>
          <span className="text-xs font-medium text-foreground">Like</span>
        </div>
      </div>

      {/* Swipe Instructions */}
      <div className="absolute top-2 left-0 right-0 flex justify-center">
        <div className="bg-background/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs text-muted-foreground border border-border/50">
          Swipe or use arrow keys
        </div>
      </div>
    </div>
  );
};

export default DiscoveryCardStack;
