
import { Card, CardContent } from "@/components/ui/card";
import { Users, Home, Camera, TrendingUp } from "lucide-react";

const PlatformStats = () => {
  const stats = [
    {
      icon: Users,
      value: "100+",
      label: "Active Creators",
      description: "Content creators from around the world"
    },
    {
      icon: Home,
      value: "50+",
      label: "Active Properties",
      description: "Unique accommodations available"
    },
    {
      icon: Camera,
      value: "500+",
      label: "Content Pieces",
      description: "High-quality content created"
    },
    {
      icon: TrendingUp,
      value: "2.5M+",
      label: "Total Reach",
      description: "Combined social media reach"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-brand-green via-emerald-600 to-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Growing Community of Success
          </h2>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Join thousands of hosts and creators who are already building successful partnerships
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-green-100 font-medium mb-1">{stat.label}</div>
                <div className="text-green-200 text-sm">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformStats;
