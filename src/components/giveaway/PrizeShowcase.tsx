import { Bed, Wifi, Car, Waves, Coffee, Star } from 'lucide-react';

export const PrizeShowcase = () => {
  const amenities = [
    { icon: Bed, label: '3 Bedrooms' },
    { icon: Waves, label: 'Beachfront' },
    { icon: Wifi, label: 'High-Speed WiFi' },
    { icon: Car, label: 'Free Parking' },
    { icon: Coffee, label: 'Full Kitchen' },
    { icon: Star, label: 'Luxury Amenities' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Your Prize Includes</h2>
        <p className="text-xl text-muted-foreground">3 nights of pure paradise</p>
      </div>

      <div className="bg-card border rounded-2xl p-8 space-y-6">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
          <div className="text-center space-y-2">
            <Waves className="h-16 w-16 mx-auto text-primary" />
            <p className="text-muted-foreground">Siesta Key Villa</p>
            <p className="text-sm text-muted-foreground">Photos coming soon!</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {amenities.map((amenity) => (
            <div key={amenity.label} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <amenity.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{amenity.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-2">
          <h3 className="font-semibold text-lg">Prize Value</h3>
          <p className="text-3xl font-bold text-primary">$1,500+</p>
          <p className="text-sm text-muted-foreground">
            Includes accommodation, taxes, and cleaning fees. Travel not included.
          </p>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>✓ Subject to availability</p>
          <p>✓ Blackout dates may apply</p>
          <p>✓ Winner must book within 90 days</p>
          <p>✓ Non-transferable</p>
        </div>
      </div>
    </div>
  );
};
