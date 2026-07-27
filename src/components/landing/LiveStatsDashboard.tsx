import { motion } from "framer-motion";
import { Users, Home, Camera, TrendingUp, Activity, UtensilsCrossed, Sparkles } from "lucide-react";
import { GlassmorphicCard } from "@/components/shared/GlassmorphicCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

const stats = [
  {
    icon: Users,
    value: 100,
    suffix: "+",
    label: "Active Creators",
    description: "Content creators worldwide",
    trend: "+12% this month",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Home,
    value: 50,
    suffix: "+",
    label: "Properties",
    description: "Unique accommodations",
    trend: "+8% this month",
    color: "from-emerald-500 to-emerald-600"
  },
  {
    icon: UtensilsCrossed,
    value: 30,
    suffix: "+",
    label: "Restaurants",
    description: "Dining experiences",
    trend: "+15% this month",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Sparkles,
    value: 40,
    suffix: "+",
    label: "Brand Campaigns",
    description: "Active partnerships",
    trend: "+20% this month",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: Camera,
    value: 500,
    suffix: "+",
    label: "Content Pieces",
    description: "High-quality content created",
    trend: "+25% this month",
    color: "from-pink-500 to-pink-600"
  },
  {
    icon: TrendingUp,
    value: 20,
    suffix: "M+",
    label: "Total Reach",
    description: "Combined social reach",
    trend: "+15% this month",
    color: "from-cyan-500 to-cyan-600"
  }
];

export const LiveStatsDashboard = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-brand-green via-emerald-600 to-brand-dark">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            <Activity className="w-4 h-4 text-white animate-pulse" />
            <span className="text-white text-sm font-medium">Live Platform Stats</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Growing Community of Success
          </h2>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Join thousands of hosts and creators building successful partnerships
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <GlassmorphicCard key={index} delay={index * 0.1} className="p-6 bg-white/10 backdrop-blur-lg">
              <div className="flex flex-col h-full">
                <div className={`w-14 h-14 mb-4 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>

                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  {...('decimals' in stat && stat.decimals !== undefined ? { decimals: stat.decimals as number } : {})}
                  className="text-4xl font-bold text-white mb-2"
                />

                <div className="text-green-100 font-semibold mb-1">{stat.label}</div>
                <div className="text-green-200/80 text-sm mb-3">{stat.description}</div>

                <motion.div
                  className="mt-auto pt-4 border-t border-white/20 text-sm text-green-200 flex items-center space-x-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.trend}</span>
                </motion.div>
              </div>
            </GlassmorphicCard>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-green-100 text-lg">
            🎉 <strong className="text-white">Real-time updates</strong> • Platform growing every day
          </p>
        </motion.div>
      </div>
    </section>
  );
};
