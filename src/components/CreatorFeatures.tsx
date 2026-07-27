import { Card, CardContent } from "@/components/ui/card";
import { 
  Plane, 
  Camera, 
  Users, 
  TrendingUp, 
  Shield,
  Calendar,
  MapPin,
  Star
} from "lucide-react";

const CreatorFeatures = () => {
  const features = [
    {
      icon: Plane,
      title: "Free Travel Opportunities",
      description: "Stay at amazing properties worldwide in exchange for authentic content creation. No upfront costs.",
      highlight: "100% Free Stays"
    },
    {
      icon: Camera,
      title: "Creative Freedom",
      description: "Create content that aligns with your style and brand while meeting host requirements and deadlines.",
      highlight: "Your Style, Your Voice"
    },
    {
      icon: Users,
      title: "Smart Matching",
      description: "Get matched with hosts whose properties align with your audience demographics and content style.",
      highlight: "Perfect Fit Guaranteed"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Track your content performance, engagement metrics, and earnings in real-time through our dashboard.",
      highlight: "Real-time Insights"
    },
    {
      icon: Shield,
      title: "Creator Protection",
      description: "Verified hosts, clear agreements, and dispute resolution to ensure safe and professional collaborations.",
      highlight: "100% Secure"
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Plan your content creation around your schedule with flexible booking and collaboration timelines.",
      highlight: "Work Your Way"
    },
    {
      icon: MapPin,
      title: "Global Network",
      description: "Access properties in 50+ destinations worldwide, from city apartments to luxury resorts.",
      highlight: "50+ Countries"
    },
    {
      icon: Star,
      title: "Creator Rewards Program",
      description: "Build your reputation, unlock premium opportunities, and earn bonus rewards for exceptional content.",
      highlight: "Exclusive Perks"
    }
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Creators 
            <span className="bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent"> Choose Us</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to turn your content creation skills into amazing travel experiences and sustainable income.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-brand-light/20"
            >
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-green to-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="mb-3">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <div className="inline-block bg-brand-green/10 text-brand-green text-xs font-medium px-3 py-1 rounded-full">
                      {feature.highlight}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CreatorFeatures;