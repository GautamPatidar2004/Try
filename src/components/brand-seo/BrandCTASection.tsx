import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";
import type { IndustryData, LocationData } from "@/data/brand-seo-pages/types";

interface BrandCTASectionProps {
  industry: IndustryData;
  location?: LocationData | null;
}

export const BrandCTASection = ({ industry, location }: BrandCTASectionProps) => {
  const headline = location
    ? `Ready to Reach ${location.name} ${industry.name} Audiences?`
    : `Ready to Launch Your ${industry.name} Campaign?`;

  const subheadline = location
    ? `Connect with ${location.creatorCount}+ verified creators in ${location.name} and start driving results today.`
    : `Join ${industry.stats.campaigns} successful campaigns and connect with ${industry.stats.creators} verified creators.`;

  return (
    <section className="py-24 bg-gradient-to-br from-purple-950 via-purple-900 to-fuchsia-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-fuchsia-300 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
          >
            <Rocket className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {headline}
          </h2>

          <p className="text-lg text-purple-100/80 mb-10 max-w-xl mx-auto">
            {subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/onboarding/brand">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-50 group">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/for-brands">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-purple-200/60">
            No credit card required • Free to browse creators • Pay only when you collaborate
          </p>
        </motion.div>
      </div>
    </section>
  );
};
