import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatorCTA = () => {
  const navigate = useNavigate();

  const benefits = [
    "Free stays at verified properties worldwide",
    "Performance-based earning opportunities", 
    "Creative freedom with your content style",
    "Professional collaboration agreements",
    "Real-time analytics and earnings tracking",
    "Global network of premium destinations"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-brand-green/5 via-background to-emerald-500/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-gradient-to-br from-card to-brand-light/20 border-brand-green/20 shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Ready to Start Your
                <span className="bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent"> Creator Journey?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of creators who are already turning their content into amazing travel experiences and earning money doing what they love.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-4 text-lg"
                onClick={() => navigate('/auth')}
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-brand-green/20 hover:bg-brand-green/5"
                onClick={() => navigate('/marketplace')}
              >
                Explore Properties
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-16 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">100+</div>
                  <div className="text-sm text-muted-foreground">Active Creators</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">4.9/5</div>
                  <div className="text-sm text-muted-foreground">Creator Rating</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CreatorCTA;