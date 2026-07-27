import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface PricingBreakdownCardProps {
  totalBudget: number;
  isGifted?: boolean;
}

const PricingBreakdownCard = ({ totalBudget, isGifted = false }: PricingBreakdownCardProps) => {
  return (
    <Card className="border-2 border-primary/20 bg-card shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          Subscription Plan Covered
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Creating and listing campaigns is fully covered by your active subscription plan. No individual listing fees or platform charges apply.
        </p>
      </CardContent>
    </Card>
  );
};

export default PricingBreakdownCard;
