import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Home, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";

const benefits = {
  host: [
    "Build your content library for free",
    "50+ assets per collaboration",
    "Full ownership & usage rights",
    "Use on 9+ marketing channels"
  ],
  creator: [
    "Access 150+ properties worldwide",
    "Free stays & amazing experiences",
    "Build your professional portfolio",
    "Join Creator Rewards Program"
  ]
};

export const FinalCTA = () => {
  const navigate = useNavigate();
  const [hoveredType, setHoveredType] = useState<'host' | 'creator' | null>(null);
  const { trackMarketingCta } = useProductAnalytics();

  const handleHostClick = () => {
    trackMarketingCta({ cta_name: 'Join as Host', page: 'landing_final_cta' });
    navigate('/auth?type=host');
  };

  const handleCreatorClick = () => {
    trackMarketingCta({ cta_name: 'Join as Creator', page: 'landing_final_cta' });
    navigate('/auth?type=influencer');
  };

  const handleBrowseClick = () => {
    trackMarketingCta({ cta_name: 'Browse Marketplace', page: 'landing_final_cta' });
    navigate('/marketplace');
  };

  return (
    <section className="py-12 md:py-24 relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-green to-emerald-600">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-48 md:w-96 h-48 md:h-96 bg-white rounded-full blur-3xl top-0 left-0 animate-blob" />
        <div className="absolute w-48 md:w-96 h-48 md:h-96 bg-white rounded-full blur-3xl bottom-0 right-0 animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            Trade Empty Nights for
            <br />
            <span className="text-green-200">A Year's Worth of Content</span>
          </h2>
          <p className="text-base md:text-xl text-green-100 max-w-2xl mx-auto mb-6 md:mb-8 px-2">
            Professional content you own forever. Use everywhere. Zero recurring fees.
          </p>
          
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-green-100 text-xs sm:text-sm">
            <div className="flex items-center">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>100% Free to join</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-green-300" />
            <div className="flex items-center">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>No credit card required</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Host Portal */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onMouseEnter={() => setHoveredType('host')}
            onMouseLeave={() => setHoveredType(null)}
            className="relative"
          >
            <div className={`
              bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-2xl md:rounded-3xl p-5 md:p-8 h-full
              transition-all duration-300 hover:scale-105 hover:border-white hover:shadow-2xl
              ${hoveredType === 'host' ? 'scale-105 border-white shadow-2xl' : ''}
            `}>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                <Home className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Partners & Hosts</h3>
              <p className="text-green-100 text-sm md:text-base mb-4 md:mb-6">Grow your business with creator content</p>

              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                {benefits.host.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center text-white text-sm md:text-base"
                  >
                    <Check className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-green-300 flex-shrink-0" />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              <Button
                size="lg"
                variant="secondary"
                className="w-full bg-white text-brand-green hover:bg-white/90 font-semibold text-base md:text-lg h-12 md:h-14"
                onClick={handleHostClick}
              >
                Join as Host
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Creator Portal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            onMouseEnter={() => setHoveredType('creator')}
            onMouseLeave={() => setHoveredType(null)}
            className="relative"
          >
            <div className={`
              bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-2xl md:rounded-3xl p-5 md:p-8 h-full
              transition-all duration-300 hover:scale-105 hover:border-white hover:shadow-2xl
              ${hoveredType === 'creator' ? 'scale-105 border-white shadow-2xl' : ''}
            `}>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Content Creators</h3>
              <p className="text-green-100 text-sm md:text-base mb-4 md:mb-6">Travel the world while growing your brand</p>

              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                {benefits.creator.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center text-white text-sm md:text-base"
                  >
                    <Check className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-green-300 flex-shrink-0" />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              <Button
                size="lg"
                variant="secondary"
                className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold text-base md:text-lg h-12 md:h-14"
                onClick={handleCreatorClick}
              >
                Join as Creator
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 md:mt-12 text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-brand-green font-semibold h-12 md:h-auto"
            onClick={handleBrowseClick}
          >
            Or Browse Marketplace First
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
