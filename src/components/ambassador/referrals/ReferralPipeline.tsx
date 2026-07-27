import { cn } from "@/lib/utils";
import { SegmentStats, ConversionStage } from "@/hooks/useAmbassadorReferrals";
import { MousePointer, UserPlus, List, Zap, Crown } from "lucide-react";

interface ReferralPipelineProps {
  stats: SegmentStats;
  activeStage?: ConversionStage | 'all';
  onStageClick?: (stage: ConversionStage | 'all') => void;
}

const PIPELINE_STAGES = [
  { key: 'clicked', label: 'Clicked', icon: MousePointer, color: 'bg-muted text-muted-foreground' },
  { key: 'signup', label: 'Signed Up', icon: UserPlus, color: 'bg-yellow-500/20 text-yellow-600' },
  { key: 'listing', label: 'Listed', icon: List, color: 'bg-blue-500/20 text-blue-600' },
  { key: 'active', label: 'Active', icon: Zap, color: 'bg-green-500/20 text-green-600' },
  { key: 'subscription', label: 'Subscribed', icon: Crown, color: 'bg-purple-500/20 text-purple-600' },
] as const;

export const ReferralPipeline = ({ stats, activeStage, onStageClick }: ReferralPipelineProps) => {
  const getCount = (stage: string) => {
    switch (stage) {
      case 'clicked': return stats.clicked;
      case 'signup': return stats.signups;
      case 'listing': return stats.listings;
      case 'active': return stats.active;
      case 'subscription': return stats.subscribed;
      default: return 0;
    }
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {PIPELINE_STAGES.map((stage, index) => {
        const count = getCount(stage.key);
        const Icon = stage.icon;
        const isActive = activeStage === stage.key;
        
        return (
          <div key={stage.key} className="flex items-center">
            <button
              onClick={() => onStageClick?.(isActive ? 'all' : stage.key as ConversionStage)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                "hover:scale-105 cursor-pointer min-w-fit",
                stage.color,
                isActive && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium whitespace-nowrap">{stage.label}</span>
                <span className="text-lg font-bold">{count}</span>
              </div>
            </button>
            
            {/* Arrow connector */}
            {index < PIPELINE_STAGES.length - 1 && (
              <div className="w-4 h-0.5 bg-border mx-1" />
            )}
          </div>
        );
      })}
      
      {/* Conversion Rate */}
      <div className="ml-4 pl-4 border-l">
        <div className="text-xs text-muted-foreground">Conversion</div>
        <div className="text-lg font-bold text-primary">
          {stats.conversionRate.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};
