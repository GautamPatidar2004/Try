import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface BrandStatsSectionProps {
  stats: { label: string; value: string }[];
}

export const BrandStatsSection = ({ stats }: BrandStatsSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-fuchsia-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-white/10 text-white border-white/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            Platform Stats
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Proven Results for Brands
          </h2>
          <p className="text-purple-100/70 max-w-2xl mx-auto">
            Join hundreds of successful brands already using our platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-purple-200/70">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
