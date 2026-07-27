import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassmorphicCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const GlassmorphicCard = ({ 
  children, 
  delay = 0,
  className = "" 
}: GlassmorphicCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};
