import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface FloatingCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const FloatingCard = ({ 
  children, 
  delay = 0,
  className = "" 
}: FloatingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.16, 1, 0.3, 1] 
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        rotateX: 5,
        rotateY: 5,
        transition: { duration: 0.3 }
      }}
      style={{ 
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      className={className}
    >
      <Card className="h-full bg-gradient-to-br from-card to-card/50 border border-border/50 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        {children}
      </Card>
    </motion.div>
  );
};
