import { motion } from "framer-motion";
import { ArrowRight, X, Check } from "lucide-react";

const comparisons = [
  {
    misconception: "A post to an audience",
    reality: "50+ pieces of marketing content",
  },
  {
    misconception: "Temporary exposure",
    reality: "Permanent content rights",
  },
  {
    misconception: "Hope for bookings",
    reality: "Assets for ads, listings, email, socials",
  },
  {
    misconception: "Influencer marketing",
    reality: "UGC marketing engine",
  },
];

export const ContentClarificationTable = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What You're <span className="text-brand-green">Actually Getting</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            What you are buying is not exposure. <strong>You are buying content ownership.</strong>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-200">
            <div className="p-4 md:p-6 text-center">
              <span className="text-sm md:text-base font-semibold text-gray-500">What hosts think</span>
            </div>
            <div className="p-4 md:p-6 text-center bg-brand-green/5">
              <span className="text-sm md:text-base font-semibold text-brand-green">What Hostfluencer delivers</span>
            </div>
          </div>

          {/* Table Body */}
          {comparisons.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              className={`grid grid-cols-2 ${index !== comparisons.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="p-4 md:p-6 flex items-center justify-center gap-2 md:gap-3">
                <X className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0" />
                <span className="text-sm md:text-base text-gray-600 text-center">{item.misconception}</span>
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center gap-2 md:gap-3 bg-brand-green/5">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-brand-green flex-shrink-0" />
                <span className="text-sm md:text-base text-foreground font-medium text-center">{item.reality}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-lg md:text-xl font-semibold text-brand-dark flex items-center justify-center gap-2">
            Trade empty nights for a year's worth of marketing content
            <ArrowRight className="w-5 h-5 text-brand-green" />
          </p>
        </motion.div>
      </div>
    </section>
  );
};
