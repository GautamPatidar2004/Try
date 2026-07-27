import { Check, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MatchReasonsProps {
  reasons: string[];
  recommendation: string;
}

const MatchReasons = ({ reasons, recommendation }: MatchReasonsProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm hover-lift">
      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-base text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Why This Match Works
          </h4>
          <ul className="space-y-2.5">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <div className="bg-primary/10 rounded-full p-0.5 mt-0.5">
                  <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                </div>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {recommendation && (
          <div className="pt-3 border-t border-primary/20">
            <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Recommendation
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchReasons;