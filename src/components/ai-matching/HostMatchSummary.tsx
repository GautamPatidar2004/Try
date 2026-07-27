import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, Users } from "lucide-react";

interface HostMatchSummaryProps {
  totalMatches: number;
  perfectMatches: number; // 90+
  excellentMatches: number; // 80-89
  propertiesWithMatches: number;
  totalProperties: number;
}

const HostMatchSummary = ({ 
  totalMatches, 
  perfectMatches, 
  excellentMatches,
  propertiesWithMatches,
  totalProperties
}: HostMatchSummaryProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Matches</p>
              <p className="text-2xl font-bold">{totalMatches}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Perfect Matches</p>
              <p className="text-2xl font-bold">{perfectMatches}</p>
              <p className="text-xs text-muted-foreground">90%+ score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Excellent Matches</p>
              <p className="text-2xl font-bold">{excellentMatches}</p>
              <p className="text-xs text-muted-foreground">80-89% score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostMatchSummary;
