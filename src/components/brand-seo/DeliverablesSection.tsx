import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import type { IndustryData, PlatformData } from "@/data/brand-seo-pages/types";

interface DeliverablesSectionProps {
  industry: IndustryData;
  platform?: PlatformData | null;
}

export const DeliverablesSection = ({ industry, platform }: DeliverablesSectionProps) => {
  const title = platform
    ? `${platform.name} Content Deliverables`
    : `Typical Content Deliverables`;

  const description = platform
    ? `Popular ${platform.name} content formats for ${industry.name.toLowerCase()} campaigns.`
    : `Content types typically included in ${industry.name.toLowerCase()} influencer collaborations.`;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            <Package className="w-4 h-4 mr-2" />
            Deliverables
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {industry.deliverables.map((deliverable, index) => {
            const Icon = deliverable.icon;
            return (
              <motion.div
                key={deliverable.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{deliverable.name}</h3>
                    <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Platform-specific formats */}
        {platform && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Popular {platform.name} Formats
            </h3>
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {platform.contentFormats.map((format) => (
                <Badge key={format} variant="outline" className="px-3 py-1">
                  {format}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
