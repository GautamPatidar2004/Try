import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { IndustryData } from "@/data/brand-seo-pages/types";

interface ProblemsSectionProps {
  industry: IndustryData;
}

export const ProblemsSection = ({ industry }: ProblemsSectionProps) => {
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
            <AlertTriangle className="w-4 h-4 mr-2" />
            The Challenge
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why {industry.plural} Need Influencer Marketing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Traditional marketing is losing effectiveness. Here's what {industry.plural.toLowerCase()} face today.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {industry.problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-destructive" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{problem.title}</h3>
                    <p className="text-sm text-muted-foreground">{problem.description}</p>
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
