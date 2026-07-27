import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake } from "lucide-react";
import type { IndustryData } from "@/data/brand-seo-pages/types";

interface CollaborationTypesSectionProps {
  industry: IndustryData;
}

export const CollaborationTypesSection = ({ industry }: CollaborationTypesSectionProps) => {
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
            <Handshake className="w-4 h-4 mr-2" />
            Collaboration Types
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ways to Work with Creators
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Flexible partnership options for {industry.plural.toLowerCase()} of all sizes and budgets.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {industry.collaborationTypes.map((collab, index) => {
            const Icon = collab.icon;
            return (
              <motion.div
                key={collab.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow bg-background">
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{collab.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{collab.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
