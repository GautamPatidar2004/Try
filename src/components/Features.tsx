
import { Card, CardContent } from "@/components/ui/card";
import { Home, Users, Camera, MessageCircle, Shield, TrendingUp } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Home,
      title: "For Hosts",
      description: "List your property and connect with talented creators who'll showcase your space through authentic content marketing."
    },
    {
      icon: Users,
      title: "For Creators",
      description: "Discover amazing accommodations worldwide and create content in exchange for free or discounted stays."
    },
    {
      icon: Camera,
      title: "Content Collaboration",
      description: "Seamlessly coordinate content requirements, deliverables, and timelines between hosts and creators."
    },
    {
      icon: MessageCircle,
      title: "Smart Matching",
      description: "Our algorithm matches hosts with creators based on audience demographics, content style, and property type."
    },
    {
      icon: TrendingUp,
      title: "Track Performance",
      description: "Monitor content performance, engagement metrics, and booking impact to maximize your marketing results."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Perks
            <span className="bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent"> of Joining</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting property hosts with content creators for mutually beneficial marketing collaborations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-brand-light/50"
            >
              <CardContent className="p-12">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-green to-emerald-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
