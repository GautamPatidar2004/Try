import { motion } from "framer-motion";
import { DollarSign, Moon, Clock, Share2 } from "lucide-react";

const valueMetrics = [
  {
    icon: DollarSign,
    label: "Typical UGC shoot cost",
    value: "$4,500",
    color: "from-red-500 to-orange-500",
    description: "Average cost to hire photographers and videographers",
  },
  {
    icon: Moon,
    label: "Cost through Hostfluencer",
    value: "One empty night",
    color: "from-brand-green to-emerald-500",
    description: "Trade an off-peak night for professional content",
  },
  {
    icon: Clock,
    label: "Content lifespan",
    value: "12-24 months",
    color: "from-blue-500 to-indigo-500",
    description: "Use the same assets for years of marketing",
  },
  {
    icon: Share2,
    label: "Usage channels",
    value: "9+",
    color: "from-purple-500 to-pink-500",
    description: "Airbnb, VRBO, Website, Instagram, Facebook Ads, TikTok, Email, Pinterest, Google Ads",
  },
];

export const ContentValueCalculator = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-brand-light/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What This Content Would{" "}
            <span className="text-brand-green">Normally Cost You</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional content creation is expensive. We made it virtually free.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 h-full flex flex-col items-center text-center transition-all duration-300 group-hover:shadow-xl">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-4`}>
                  <metric.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                
                <span className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide mb-2">
                  {metric.label}
                </span>
                
                <span className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-3`}>
                  {metric.value}
                </span>
                
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {metric.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-brand-green/10 rounded-full">
            <span className="text-lg md:text-xl font-bold text-brand-green">
              ROI: 4,500% return on one empty night
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
