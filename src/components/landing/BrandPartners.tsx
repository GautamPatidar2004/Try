import { motion } from 'framer-motion';

const brands = [
  { name: 'Rivian', category: 'Automotive' },
  { name: 'Blessed Bananas', category: 'Hair Care' },
  { name: 'Nike', category: 'Athletic' },
  { name: 'Odele', category: 'Beauty' },
  { name: 'CarBlip', category: 'Automotive' },
  { name: 'Lasio', category: 'Hair Care' },
  { name: 'Appleton Estate', category: 'Spirits' },
  { name: 'Swimply', category: 'Marketplace' },
];

const BrandPartners = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Trusted By
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Industry-Leading Brands & Partners
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto"
        >
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 hover:bg-background transition-all duration-300"
            >
              <span className="text-lg md:text-xl font-bold text-foreground/70 group-hover:text-foreground transition-colors">
                {brand.name}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {brand.category}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          Join 500+ creators and hosts building partnerships with top brands
        </motion.p>
      </div>
    </section>
  );
};

export default BrandPartners;
