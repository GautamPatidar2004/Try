import { motion } from "framer-motion";
import { Users, Home, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

export const SocialProofStats = () => {
  const stats = [
    {
      icon: Users,
      value: 500,
      suffix: "+",
      label: "Content Assets Created",
    },
    {
      icon: Home,
      value: 150,
      suffix: "+",
      label: "Properties Listed",
    },
    {
      icon: TrendingUp,
      value: 675,
      suffix: "K+",
      label: "Content Value Delivered",
    },
  ];

  return (
    <section className="py-10 md:py-16 bg-white border-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-6 sm:gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex flex-col items-center text-center ${
                index !== stats.length - 1 ? 'border-b sm:border-b-0 sm:border-r border-border pb-6 sm:pb-0' : ''
              }`}
            >
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-brand-green/10 flex items-center justify-center mb-2 md:mb-4">
                <stat.icon className="w-5 h-5 md:w-8 md:h-8 text-brand-green" />
              </div>
              <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-brand-green mb-1 md:mb-2">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2000} />
              </div>
              <div className="text-xs md:text-base text-muted-foreground font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
