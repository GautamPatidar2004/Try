
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Camera, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TargetAudience = () => {
  const navigate = useNavigate();

  const audiences = [
    {
      id: "hosts",
      icon: Home,
      title: "For Property Hosts",
      subtitle: "Boost your bookings with authentic content",
      benefits: [
        "100% FREE platform access - no subscription required",
        "Get high-quality content showcasing your property",
        "Reach new audiences through creator networks",
        "Increase direct bookings and revenue",
        "Connect with verified content creators"
      ],
      cta: "List Your Property Free",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "creators",
      icon: Camera,
      title: "For Content Creators",
      subtitle: "Travel the world while growing your brand",
      benefits: [
        "Access unique properties for content creation",
        "Get free or discounted accommodations",
        "Earn commissions based on your post views",
        "Join our Creator Rewards Program after 2 stays",
        "Build your travel portfolio with unique experiences"
      ],
      cta: "Start Creating",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <section id="for-hosts" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Built For
            <span className="bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent"> Everyone</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're a property host looking to boost bookings or a creator seeking amazing travel opportunities, we've got you covered.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {audiences.map((audience) => (
            <Card key={audience.id} className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 ${audience.bgColor}`}>
              <CardContent className="p-8">
                <div className={`w-16 h-16 mb-6 bg-gradient-to-br ${audience.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <audience.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{audience.title}</h3>
                <p className="text-lg text-gray-600 mb-6">{audience.subtitle}</p>
                
                <ul className="space-y-3 mb-8">
                  {audience.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-brand-green rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-brand-green to-emerald-600 hover:from-brand-green/90 hover:to-emerald-600/90 text-white font-semibold"
                  onClick={() => navigate('/auth')}
                >
                  {audience.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;
