import React from 'react';
import { PricingPlans } from '@/components/subscription/PricingPlans';
import { motion } from 'framer-motion';
import { Building2, Check } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { SEO, generateBreadcrumbSchema } from "@/components/SEO";
import { PillChip } from "@/components/landing/editorial/primitives";

const Pricing = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Pricing", url: "/pricing" }
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Brand & Host Pricing Plans - Hostfluencer"
        description="Transparent, flexible subscription plans for brands and hosts. Unlock powerful features to grow your business and streamline creator collaborations."
        canonical="/pricing"
        keywords="brand marketplace pricing, host subscription, hostfluencer plans, business pricing"
        schema={breadcrumbSchema}
      />
      <Navigation />

      <div className="relative bg-background">
        <div className="relative container mx-auto pt-28 pb-12 px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <PillChip className="mb-6">Pricing Plans</PillChip>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.05] mb-6">
              Pricing for{" "}
              <em className="not-italic italic text-brand-green">brands & hosts</em>
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Unlock powerful features to grow your business and streamline creator collaborations with transparent, flexible pricing
            </p>
          </motion.div>

          <PricingPlans />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
