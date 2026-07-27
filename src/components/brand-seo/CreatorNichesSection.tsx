import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { PlatformData, LocationData } from "@/data/brand-seo-pages/types";

interface CreatorNichesSectionProps {
  niches: string[];
  platform?: PlatformData | null;
  location?: LocationData | null;
}

export const CreatorNichesSection = ({ niches, platform, location }: CreatorNichesSectionProps) => {
  const title = platform && location
    ? `${platform.name} Creator Niches in ${location.name}`
    : platform
    ? `${platform.name} Creator Niches`
    : location
    ? `Creator Niches in ${location.name}`
    : "Creator Niches Available";

  const description = platform
    ? `Access creators across these popular ${platform.name} niches. Each creator is verified for authenticity and engagement quality.`
    : location
    ? `Connect with ${location.name}-based creators specializing in these popular content categories.`
    : "Partner with creators across a wide range of content specializations.";

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            <Users className="w-4 h-4 mr-2" />
            Creator Categories
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
        >
          {niches.map((niche, index) => (
            <motion.div
              key={niche}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-medium bg-background border shadow-sm hover:shadow-md transition-shadow cursor-default"
              >
                {niche}
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        {location && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-8 text-muted-foreground"
          >
            <span className="font-semibold text-foreground">{location.creatorCount}+</span> verified creators in {location.name}, {location.state}
          </motion.p>
        )}

        {platform && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-muted-foreground">
              Average engagement rate: <span className="font-semibold text-foreground">{platform.avgEngagement}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Audience: {platform.audienceDemo}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};
