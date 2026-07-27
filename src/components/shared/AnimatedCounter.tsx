import { useCountUp } from "@/hooks/useCountUp";
import { motion } from "framer-motion";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter = ({ 
  end, 
  duration = 2000, 
  prefix = "", 
  suffix = "",
  decimals = 0,
  className = "" 
}: AnimatedCounterProps) => {
  const { count, ref } = useCountUp(end, duration);
  
  const displayValue = decimals > 0 
    ? (count / Math.pow(10, decimals)).toFixed(decimals)
    : count.toString();

  return (
    <div ref={ref} className={className}>
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {prefix}{displayValue}{suffix}
      </motion.span>
    </div>
  );
};
