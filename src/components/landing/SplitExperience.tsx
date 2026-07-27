import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Camera, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const experiences = {
  host: {
    icon: Home,
    title: "Partners & Hosts",
    subtitle: "Grow your reach with authentic creator content",
    gradient: "from-blue-500 via-blue-600 to-indigo-600",
    benefits: [
      "List properties, restaurants, experiences & brand campaigns",
      "Connect with creators matching your audience",
      "Increase bookings, visits, engagement & brand awareness",
      "Track ROI and content performance",
      "Access verified creators with proven results"
    ],
    cta: "List Your Business",
    stats: { properties: "200+", bookingIncrease: "40%" }
  },
  creator: {
    icon: Camera,
    title: "Content Creators",
    subtitle: "Turn your influence into unforgettable experiences",
    gradient: "from-purple-500 via-purple-600 to-pink-600",
    benefits: [
      "Access properties, restaurants, experiences & brand partnerships",
      "Free stays, dining, unique experiences & paid campaigns",
      "Build your portfolio with real collaborations",
      "Join Creator Rewards program",
      "Earn commissions on content performance"
    ],
    cta: "Start Creating",
    stats: { creators: "100+", avgEarnings: "$500/post" }
  }
};

export const SplitExperience = () => {
  const [hoveredSide, setHoveredSide] = useState<'host' | 'creator' | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getWidth = (side: 'host' | 'creator') => {
    if (isMobile) return "100%";
    if (hoveredSide === null) return "50%";
    return hoveredSide === side ? "65%" : "35%";
  };

  return (
    <section className="relative min-h-screen md:h-screen overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">
        {/* Host Side */}
        <motion.div
          className="relative overflow-hidden cursor-pointer min-h-[400px] md:min-h-0"
          style={{ width: isMobile ? "100%" : getWidth('host') }}
          animate={{ width: isMobile ? "100%" : getWidth('host') }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onMouseEnter={() => !isMobile && setHoveredSide('host')}
          onMouseLeave={() => !isMobile && setHoveredSide(null)}
          onClick={() => isMobile && setHoveredSide(hoveredSide === 'host' ? null : 'host')}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${experiences.host.gradient}`} />
          
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-6 md:p-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <experiences.host.icon className="w-16 h-16 md:w-24 md:h-24 mb-4 md:mb-6" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-center">
              {experiences.host.title}
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-center opacity-90">
              {experiences.host.subtitle}
            </p>

            <AnimatePresence>
              {hoveredSide === 'host' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-4 mb-8 max-w-md"
                >
                  {experiences.host.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <Check className="w-6 h-6 flex-shrink-0 mt-1" />
                      <span className="text-base md:text-lg">{benefit}</span>
                    </motion.div>
                  ))}

                  <div className="grid grid-cols-2 gap-4 pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{experiences.host.stats.properties}</div>
                      <div className="text-sm opacity-80">Partners</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{experiences.host.stats.bookingIncrease}</div>
                      <div className="text-sm opacity-80">Avg. Increase</div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold"
                    onClick={() => navigate('/auth?type=host')}
                  >
                    {experiences.host.cta}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Creator Side */}
        <motion.div
          className="relative overflow-hidden cursor-pointer min-h-[400px] md:min-h-0"
          style={{ width: isMobile ? "100%" : getWidth('creator') }}
          animate={{ width: isMobile ? "100%" : getWidth('creator') }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onMouseEnter={() => !isMobile && setHoveredSide('creator')}
          onMouseLeave={() => !isMobile && setHoveredSide(null)}
          onClick={() => isMobile && setHoveredSide(hoveredSide === 'creator' ? null : 'creator')}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${experiences.creator.gradient}`} />
          
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-6 md:p-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <experiences.creator.icon className="w-16 h-16 md:w-24 md:h-24 mb-4 md:mb-6" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-center">
              {experiences.creator.title}
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-center opacity-90">
              {experiences.creator.subtitle}
            </p>

            <AnimatePresence>
              {hoveredSide === 'creator' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-4 mb-8 max-w-md"
                >
                  {experiences.creator.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <Check className="w-6 h-6 flex-shrink-0 mt-1" />
                      <span className="text-base md:text-lg">{benefit}</span>
                    </motion.div>
                  ))}

                  <div className="grid grid-cols-2 gap-4 pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{experiences.creator.stats.creators}</div>
                      <div className="text-sm opacity-80">Creators</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{experiences.creator.stats.avgEarnings}</div>
                      <div className="text-sm opacity-80">Avg. Earnings</div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
                    onClick={() => navigate('/auth?type=influencer')}
                  >
                    {experiences.creator.cta}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Center divider with improved hint */}
      <AnimatePresence>
        {hoveredSide === null && !isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse" />
              
              {/* Main pill */}
              <div className="relative backdrop-blur-md bg-black/40 border border-white/20 text-white px-8 py-4 rounded-full shadow-2xl">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                  <span className="text-base font-semibold">Hover either side to explore</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
