import { motion, useScroll } from "framer-motion";

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-green via-emerald-500 to-brand-green origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  );
};
