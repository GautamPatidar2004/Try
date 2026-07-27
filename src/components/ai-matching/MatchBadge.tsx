import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchBadgeProps {
  score: number;
  className?: string;
  showIcon?: boolean;
}

const MatchBadge = ({ score, className, showIcon = true }: MatchBadgeProps) => {
  const getMatchLevel = (score: number) => {
    if (score >= 90) return { label: 'Perfect Match', color: 'bg-gradient-to-r from-green-500 to-green-600 text-white' };
    if (score >= 80) return { label: 'Excellent Match', color: 'bg-gradient-to-r from-green-500 to-green-600 text-white' };
    if (score >= 70) return { label: 'Good Match', color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' };
    if (score >= 60) return { label: 'Fair Match', color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' };
    return { label: 'Low Match', color: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' };
  };

  const matchLevel = getMatchLevel(score);

  return (
    <Badge 
      className={cn(
        "px-3 py-1 font-semibold text-sm flex items-center gap-1.5",
        matchLevel.color,
        className
      )}
    >
      {showIcon && <Sparkles className="h-3.5 w-3.5" />}
      <span>{score}% Match</span>
    </Badge>
  );
};

export default MatchBadge;