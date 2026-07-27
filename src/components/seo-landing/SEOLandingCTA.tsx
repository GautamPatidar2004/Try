import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";

interface SEOLandingCTAProps {
  headline: string;
  subheadline: string;
  buttonText: string;
  onButtonClick?: () => void;
  pageName?: string;
}

const SEOLandingCTA = ({ headline, subheadline, buttonText, onButtonClick, pageName = 'seo_landing' }: SEOLandingCTAProps) => {
  const navigate = useNavigate();
  const { trackMarketingCta } = useProductAnalytics();

  const handleClick = () => {
    trackMarketingCta({ cta_name: buttonText, page: pageName });
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-br from-[hsl(var(--hostfluencer-green))] via-teal-600 to-emerald-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Award className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            {headline}
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {subheadline}
          </p>
          <Button 
            size="lg"
            className="bg-white text-[hsl(var(--hostfluencer-green))] hover:bg-white/90 h-14 px-10 font-semibold text-lg shadow-xl"
            onClick={handleClick}
          >
            {buttonText}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default SEOLandingCTA;
