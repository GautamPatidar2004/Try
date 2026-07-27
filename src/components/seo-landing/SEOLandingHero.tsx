import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";

interface SEOLandingHeroProps {
  badge: string;
  headline: string;
  highlightedText: string;
  subheadline: string;
  primaryCTA: string;
  secondaryCTA: string;
  primaryAction?: () => void;
  secondaryAction?: () => void;
  pageName?: string;
}

const SEOLandingHero = ({
  badge,
  headline,
  highlightedText,
  subheadline,
  primaryCTA,
  secondaryCTA,
  primaryAction,
  secondaryAction,
  pageName = 'seo_landing'
}: SEOLandingHeroProps) => {
  const navigate = useNavigate();
  const { trackMarketingCta } = useProductAnalytics();

  const handlePrimaryClick = () => {
    trackMarketingCta({ cta_name: primaryCTA, page: pageName });
    if (primaryAction) {
      primaryAction();
    } else {
      navigate('/auth');
    }
  };

  const handleSecondaryClick = () => {
    trackMarketingCta({ cta_name: secondaryCTA, page: pageName });
    if (secondaryAction) {
      secondaryAction();
    } else {
      navigate('/pricing');
    }
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      <motion.div 
        className="absolute top-20 right-20 w-96 h-96 bg-[hsl(var(--hostfluencer-green))]/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-20 left-20 w-72 h-72 bg-[hsl(var(--hostfluencer-green))]/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 6, repeat: Infinity, delay: 2 }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-[hsl(var(--hostfluencer-green))]/10 rounded-full text-[hsl(var(--hostfluencer-green))] text-sm font-medium mb-6">
            <Home className="w-4 h-4 mr-2" />
            {badge}
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {headline}{" "}
            <span className="bg-gradient-to-r from-[hsl(var(--hostfluencer-green))] via-teal-500 to-emerald-600 bg-clip-text text-transparent">
              {highlightedText}
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-[hsl(var(--hostfluencer-green))] hover:bg-[hsl(var(--hostfluencer-green))]/90 text-white h-14 px-8 font-semibold"
              onClick={handlePrimaryClick}
            >
              {primaryCTA}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-[hsl(var(--hostfluencer-green))] text-[hsl(var(--hostfluencer-green))] hover:bg-[hsl(var(--hostfluencer-green))]/5 h-14 px-8 font-semibold"
              onClick={handleSecondaryClick}
            >
              {secondaryCTA}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SEOLandingHero;
