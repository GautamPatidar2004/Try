import { motion } from "framer-motion";
import { Camera, Video, Sparkles, Shield } from "lucide-react";

interface DeliverableItem {
  count: string;
  type: string;
  description: string;
}

interface DeliverablesShowcaseProps {
  title: string;
  subtitle: string;
  items: DeliverableItem[];
}

const iconMap: Record<number, React.ElementType> = {
  0: Camera,
  1: Video,
  2: Sparkles,
  3: Shield
};

const DeliverablesShowcase = ({ title, subtitle, items }: DeliverablesShowcaseProps) => {
  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {subtitle}
          </motion.p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item, index) => {
            const Icon = iconMap[index] || Camera;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 sm:p-8 rounded-2xl border border-[hsl(var(--hostfluencer-green))]/20 bg-gradient-to-br from-white to-emerald-50 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-[hsl(var(--hostfluencer-green))]/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-[hsl(var(--hostfluencer-green))]" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-[hsl(var(--hostfluencer-green))] mb-2">
                  {item.count}
                </div>
                <div className="text-lg font-semibold mb-2">{item.type}</div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DeliverablesShowcase;
