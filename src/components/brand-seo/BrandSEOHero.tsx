import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import type { IndustryData, PlatformData, LocationData, PageContent } from "@/data/brand-seo-pages/types";

interface BrandSEOHeroProps {
  content: PageContent;
  industry: IndustryData;
  platform?: PlatformData | null;
  location?: LocationData | null;
}

export const BrandSEOHero = ({ content, industry, platform, location }: BrandSEOHeroProps) => {
  const IndustryIcon = industry.icon;

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Badge className="mb-6 px-4 py-2 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              <IndustryIcon className="w-4 h-4 mr-2" />
              {content.badge}
            </Badge>
          </motion.div>

          {/* H1 Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            {content.headline}{" "}
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-fuchsia-300 bg-clip-text text-transparent">
              {content.highlightedText}
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-purple-100/80 mb-10 max-w-2xl mx-auto"
          >
            {content.subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/onboarding/brand">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-50 group">
                <Sparkles className="w-5 h-5 mr-2" />
                Launch Campaign
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Browse Creators
              </Button>
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{industry.stats.creators}</div>
              <div className="text-sm text-purple-200/70">Verified Creators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{industry.stats.campaigns}</div>
              <div className="text-sm text-purple-200/70">Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{industry.stats.avgReach}</div>
              <div className="text-sm text-purple-200/70">Avg Reach</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
