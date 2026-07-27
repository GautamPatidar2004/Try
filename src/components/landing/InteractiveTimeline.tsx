import { motion } from "framer-motion";
import { Search, MessageCircle, Camera, TrendingUp } from "lucide-react";
import { FloatingCard } from "@/components/shared/FloatingCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: Search,
    title: "List Your Property",
    description: "Property owners list their space and content requirements. No need for expensive photographers or videographers.",
    details: "Describe your property, set your content needs, and choose available dates. Our platform handles the rest.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: MessageCircle,
    title: "Get Matched",
    description: "Our AI matches you with creators whose portfolio and style fit your property perfectly.",
    details: "Review creator profiles, past work, and content samples. Approve the best matches for your property.",
    color: "from-brand-green to-emerald-600"
  },
  {
    icon: Camera,
    title: "Content Creation",
    description: "Creators produce 50+ professional content pieces—photos, videos, reels—during their stay.",
    details: "Track deliverables, review content before approval, and ensure quality meets your standards.",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: TrendingUp,
    title: "Own Forever",
    description: "Receive a full content library with perpetual ownership rights. Use everywhere, forever.",
    details: "Full commercial rights to use across Airbnb, VRBO, your website, social ads, email, and more.",
    color: "from-orange-500 to-orange-600"
  }
];

export const InteractiveTimeline = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 via-white to-brand-light/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 md:w-64 h-32 md:h-64 bg-brand-green/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-48 md:w-96 h-48 md:h-96 bg-emerald-400/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6">
            How It
            <span className="gradient-text"> Works</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Four simple steps to build your property's content library at near-zero cost.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-12">
          {steps.map((step, index) => (
            <FloatingCard key={index} delay={index * 0.1}>
              <CardContent className="p-4 md:p-8 text-center h-full flex flex-col">
                <motion.div 
                  className={`w-14 h-14 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-gradient-to-br ${step.color} rounded-xl md:rounded-2xl flex items-center justify-center`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <step.icon className="w-7 h-7 md:w-10 md:h-10 text-white" />
                </motion.div>
                
                <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 md:mb-4 bg-gradient-to-br from-brand-green to-emerald-500 rounded-full flex items-center justify-center text-sm md:text-lg font-bold text-white">
                  {index + 1}
                </div>
                
                <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-4">{step.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4 flex-grow">{step.description}</p>
                
                <motion.details 
                  className="text-xs md:text-sm text-muted-foreground text-left mt-2 md:mt-4 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <summary className="font-semibold text-brand-green hover:text-emerald-600">
                    Learn more →
                  </summary>
                  <p className="mt-2 pl-3 md:pl-4 border-l-2 border-brand-green/30 text-xs md:text-sm">{step.details}</p>
                </motion.details>
              </CardContent>
            </FloatingCard>
          ))}
        </div>

        <motion.div 
          className="text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            size="lg" 
            variant="premium"
            className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 text-base md:text-lg"
            onClick={() => navigate('/marketplace')}
          >
            Start Your Journey
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
