import { Palmtree, Gift, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GiveawayHeroProps {
  onEnterClick: () => void;
}

export const GiveawayHero = ({ onEnterClick }: GiveawayHeroProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20 rounded-3xl p-8 md:p-12">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="flex justify-center gap-2 mb-4">
          <Palmtree className="h-8 w-8 text-primary animate-pulse" />
          <Gift className="h-8 w-8 text-accent animate-bounce" />
          <Palmtree className="h-8 w-8 text-primary animate-pulse" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            WIN A 3-NIGHT STAY
          </span>
        </h1>
        
        <div className="flex items-center justify-center gap-2 text-xl md:text-2xl text-muted-foreground">
          <MapPin className="h-6 w-6 text-primary" />
          <span>Siesta Key Paradise Villa</span>
        </div>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience luxury beachfront living at our stunning Siesta Key villa. 
          Your dream vacation awaits! 🏖️
        </p>
        
        <div className="pt-4">
          <Button 
            size="lg" 
            onClick={onEnterClick}
            className="text-lg px-8 py-6 animate-pulse hover:animate-none"
          >
            <Gift className="mr-2 h-5 w-5" />
            Enter Now - It's Free!
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground pt-4">
          <p>🗓️ Winner Announced: <strong>10/31 via Instagram Live</strong></p>
          <p className="mt-1">🎯 US Residents 18+ Only</p>
        </div>
      </div>
    </div>
  );
};
