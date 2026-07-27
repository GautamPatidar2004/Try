import { Sparkles, Zap, Target, Globe } from "lucide-react";
import { DiscoveryAIDemo } from "./demo/DiscoveryAIDemo";
import { motion } from "framer-motion";

export const AIDiscoverySection = () => {
  const features = [
    { icon: Zap, label: "Instant responses" },
    { icon: Target, label: "Personalized matches" },
    { icon: Globe, label: "Real-time data" },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Discovery
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet Hosty, Your Intelligent Assistant
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect creators, properties, and brand partnerships with our 
            AI-powered discovery assistant. Just ask and get instant, personalized results.
          </p>
        </motion.div>

        {/* Demo Chat */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <DiscoveryAIDemo />
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          {features.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <feature.icon className="h-4 w-4 text-primary" />
              <span>{feature.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
