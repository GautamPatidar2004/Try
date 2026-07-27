import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { DiscoveryAIDemo } from "@/components/landing/demo/DiscoveryAIDemo";

const Hero = () => {
  const navigate = useNavigate();
  const mousePosition = useMouseParallax(15);

  const scrollToNext = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const features = [
    "50+ Content Assets Per Stay",
    "Full Content Ownership",
    "9+ Marketing Channels"
  ];

  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-br from-brand-light via-white to-green-50 overflow-hidden pt-20 pb-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      
      <motion.div 
        className="absolute top-20 left-20 w-72 h-72 bg-brand-green/20 rounded-full blur-3xl opacity-30"
        animate={{
          x: mousePosition.x * 2,
          y: mousePosition.y * 2,
        }}
        transition={{ type: "spring", stiffness: 50 }}
      />
      
      <motion.div 
        className="absolute bottom-20 right-20 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl opacity-20"
        animate={{
          x: -mousePosition.x * 1.5,
          y: -mousePosition.y * 1.5,
        }}
        transition={{ type: "spring", stiffness: 50 }}
      />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl opacity-20 animate-pulse" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            {/* Trust Badge */}
            <motion.div 
              className="inline-flex items-center px-4 py-2 bg-brand-green/10 rounded-full text-brand-dark text-sm font-medium mb-6"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-brand-green rounded-full mr-2 animate-pulse" />
              UGC Content Platform
            </motion.div>
            
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="block text-foreground">Build Your Property's</span>
              <span className="bg-gradient-to-r from-brand-green via-emerald-600 to-brand-dark bg-clip-text text-transparent">
                Content Library
              </span>
            </h1>
            
            {/* Description */}
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Trade one empty night for 50+ professional marketing assets you own forever.
            </motion.p>
            
            {/* CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                size="lg" 
                className="bg-brand-green hover:bg-brand-green/90 text-white h-12 md:h-14 px-6 md:px-8 font-semibold text-base md:text-lg group"
                onClick={() => navigate('/for-hosts')}
              >
                List Your Property
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="h-12 md:h-14 px-6 md:px-8 border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white font-semibold text-base md:text-lg transition-all duration-300"
                onClick={() => navigate('/auth')}
              >
                Get Started Free
              </Button>
            </motion.div>

            {/* Feature Checkmarks */}
            <motion.div 
              className="flex flex-wrap gap-4 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {features.map((feature, index) => (
                <div key={feature} className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-brand-green/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-brand-green" />
                  </div>
                  {feature}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Hosty Chat Demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="lg:transform lg:rotate-1 lg:hover:rotate-0 transition-transform duration-300">
              <DiscoveryAIDemo />
            </div>
            
            {/* Decorative glow behind the chat */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-green/20 to-emerald-400/20 rounded-2xl blur-2xl -z-10 opacity-50" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-brand-green cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        whileHover={{ scale: 1.1 }}
      >
        <ChevronDown className="w-8 h-8" />
      </motion.button>
    </div>
  );
};

export default Hero;
