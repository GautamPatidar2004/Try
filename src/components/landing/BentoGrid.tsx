import { motion } from "framer-motion";
import { Home, Users, Camera, MessageCircle, TrendingUp, Sparkles } from "lucide-react";
import { GlassmorphicCard } from "@/components/shared/GlassmorphicCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

const features = [
  {
    icon: Home,
    title: "For Property Owners",
    description: "Build a professional content library without hiring photographers or videographers. Get 50+ reusable marketing assets from every collaboration.",
    stat: { value: 150, suffix: "+", label: "Properties Listed" },
    size: "large"
  },
  {
    icon: Users,
    title: "For Content Creators",
    description: "Create content in beautiful properties and build your portfolio. Get free stays while producing professional work.",
    stat: { value: 100, suffix: "+", label: "Active Creators" },
    size: "large"
  },
  {
    icon: Camera,
    title: "Content Ownership",
    description: "Full commercial rights to all content. Use across 9+ marketing channels forever.",
    size: "small"
  },
  {
    icon: MessageCircle,
    title: "Smart Matching",
    description: "Algorithm-powered matches based on content style, property type, and creator portfolio.",
    size: "small"
  },
  {
    icon: TrendingUp,
    title: "Content Value",
    description: "Track the value of content created and its impact across your marketing channels.",
    stat: { value: 675000, suffix: "+", label: "Content Value Delivered" },
    size: "medium"
  },
  {
    icon: Sparkles,
    title: "Creator Rewards",
    description: "Creators earn commissions based on post views after completing just two stays.",
    size: "medium"
  }
];

export const BentoGrid = () => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-white via-brand-light/20 to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-10 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
            Everything You Need to
            <span className="gradient-text"> Succeed</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive platform built for seamless collaboration between hosts and creators.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`
                ${feature.size === 'large' ? 'lg:col-span-2 lg:row-span-2' : ''}
                ${feature.size === 'medium' ? 'lg:col-span-2' : ''}
              `}
            >
              <GlassmorphicCard className="h-full p-5 sm:p-6 md:p-8 bg-gradient-to-br from-card to-card/80 hover-lift">
                <div className={`w-16 h-16 mb-6 bg-gradient-to-br from-brand-green to-emerald-500 rounded-2xl flex items-center justify-center ${feature.size === 'large' ? 'w-20 h-20' : ''}`}>
                  <feature.icon className={`text-white ${feature.size === 'large' ? 'w-10 h-10' : 'w-8 h-8'}`} />
                </div>
                
                <h3 className={`font-bold text-foreground mb-3 ${feature.size === 'large' ? 'text-3xl' : 'text-xl'}`}>
                  {feature.title}
                </h3>
                
                <p className={`text-muted-foreground ${feature.size === 'large' ? 'text-lg mb-8' : 'text-base'}`}>
                  {feature.description}
                </p>

                {feature.stat && (
                  <div className="mt-auto pt-6 border-t border-border/30">
                    <AnimatedCounter
                      end={feature.stat.value}
                      suffix={feature.stat.suffix}
                      className="text-4xl font-bold text-brand-green mb-2"
                    />
                    <p className="text-sm text-muted-foreground">{feature.stat.label}</p>
                  </div>
                )}
              </GlassmorphicCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
