import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, MapPin, Star, Users, Gift, Camera } from 'lucide-react';

interface RestaurantsComingSoonProps {
  onNavigate?: (tab: 'discovery' | 'properties') => void;
}

export const RestaurantsComingSoon = ({ onNavigate }: RestaurantsComingSoonProps) => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6">
            <UtensilsCrossed className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Restaurant Partnerships Coming Soon!
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're creating an exciting marketplace where creators can partner with premium restaurants for exclusive dining experiences and authentic content creation.
          </p>
        </div>

        {/* Feature Preview Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <UtensilsCrossed className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Exclusive Dining Experiences</h3>
                  <p className="text-muted-foreground text-sm">
                    Partner with premium restaurants for unique content creation opportunities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Content Creator Perks</h3>
                  <p className="text-muted-foreground text-sm">
                    Special rates and complimentary meals in exchange for authentic reviews
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Direct Restaurant Partnerships</h3>
                  <p className="text-muted-foreground text-sm">
                    Build lasting relationships with restaurant owners and managers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Food & Travel Content</h3>
                  <p className="text-muted-foreground text-sm">
                    Combine dining experiences with travel content creation opportunities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-2xl font-bold mb-3">In the meantime, explore our platform</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Discover amazing creators and exclusive properties while we prepare the restaurant marketplace
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => onNavigate?.('discovery')}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Discover Creators
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => onNavigate?.('properties')}
                className="gap-2"
              >
                <Star className="w-4 h-4" />
                Explore Properties
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Badge */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Stay tuned for updates! We'll notify all users when the restaurant marketplace launches.
          </p>
        </div>
      </div>
    </div>
  );
};
