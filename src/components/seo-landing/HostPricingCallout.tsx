import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HostPricingCalloutProps {
  title: string;
  subtitle: string;
  highlight: string;
  ctaText: string;
}

const HostPricingCallout = ({ title, subtitle, highlight, ctaText }: HostPricingCalloutProps) => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-r from-[hsl(var(--hostfluencer-green))] to-teal-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-white"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
            <BadgeCheck className="w-5 h-5" />
            <span className="font-medium">No Hidden Fees</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-lg sm:text-xl opacity-90 mb-6">
            {subtitle}
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 border border-white/20">
            <p className="text-xl sm:text-2xl font-semibold">
              {highlight}
            </p>
          </div>
          
          <Button 
            size="lg"
            className="bg-white text-[hsl(var(--hostfluencer-green))] hover:bg-white/90 h-14 px-8 font-semibold group"
            onClick={() => navigate('/pricing')}
          >
            {ctaText}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HostPricingCallout;
