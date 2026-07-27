
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, Camera, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Search,
      title: "Discover & Connect",
      description: "Hosts list their properties and browse creator profiles. Creators explore amazing properties and connect with hosts.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: MessageCircle,
      title: "Collaborate & Plan",
      description: "Use our platform to discuss collaboration details, content requirements, and stay dates directly with your match.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Camera,
      title: "Create & Deliver",
      description: "Creators enjoy amazing stays while producing high-quality content that showcases the property authentically.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Earn & Succeed",
      description: "Hosts get increased bookings through authentic content. Creators earn commissions based on post views through our Creator Rewards Program - qualify after completing two stays!",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How Hostfluencer
            <span className="bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent"> Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform makes it simple for hosts and creators to find, connect, and collaborate on authentic content marketing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="w-8 h-8 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-brand-green to-emerald-600 hover:from-brand-green/90 hover:to-emerald-600/90 text-white font-semibold px-8 py-4 text-lg"
            onClick={() => navigate('/marketplace')}
          >
            Start Your Collaboration Journey
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
