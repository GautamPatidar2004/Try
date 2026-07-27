import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, MousePointerClick } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { executeBadgeAction } from "@/lib/badgeActionRouter";
import { BadgeTooltip } from "./BadgeTooltip";
import { BadgeChallengeModal } from "./BadgeChallengeModal";
import { BadgeDefinition } from "@/types/badge";

interface BadgeCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
  metadata?: any;
  tier?: string;
  points_reward?: number;
  category?: string;
}

export const BadgeCard = ({ id, name, description, icon, earned, earned_at, tier, points_reward, category }: BadgeCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, []);

  const getTierColor = (badgeTier?: string) => {
    switch (badgeTier) {
      case 'bronze': return 'from-orange-500/10 to-orange-500/5';
      case 'silver': return 'from-slate-400/10 to-slate-400/5';
      case 'gold': return 'from-yellow-500/10 to-yellow-500/5';
      case 'platinum': return 'from-cyan-400/10 to-cyan-400/5';
      case 'diamond': return 'from-blue-400/10 to-blue-400/5';
      default: return 'from-primary/10 to-primary/5';
    }
  };

  const handleClick = () => {
    if (earned) {
      executeBadgeAction(name, navigate, toast, earned);
    } else {
      setShowChallengeModal(true);
    }
  };

  return (
    <>
      <BadgeTooltip 
        badgeName={name} 
        description={description} 
        isEarned={earned}
      >
      <Card 
        className={`relative transition-all duration-200 bg-gradient-to-br ${getTierColor(tier)} ${
          earned 
            ? 'border-primary/30 hover:shadow-md' 
            : 'opacity-60 hover:opacity-80 cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
        }`}
        onClick={handleClick}
      >
        <CardContent className="p-4">
        {tier && (
          <Badge variant="outline" className="absolute top-2 right-2 text-[10px] px-1 py-0">
            {tier}
          </Badge>
        )}
        
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Badge Icon */}
          <div className={`text-4xl mt-2 ${earned ? 'grayscale-0' : 'grayscale opacity-50'}`}>
            {icon}
          </div>
          
          {/* Badge Name */}
          <h3 className={`font-semibold text-sm ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
            {name}
          </h3>
          
          {/* Badge Description */}
          <p className={`text-xs leading-relaxed ${earned ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
            {description}
          </p>
          
          {/* Points Reward */}
          {points_reward && points_reward > 0 && (
            <div className="flex items-center gap-1 text-primary text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>+{points_reward} pts</span>
            </div>
          )}
          
          {/* Status */}
          <div className="w-full">
            {earned ? (
              <div className="space-y-2">
                <Badge variant="default" className="w-full bg-primary text-primary-foreground">
                  ✓ Earned
                </Badge>
                {earned_at && (
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(earned_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="outline" className="w-full border-muted-foreground/30 text-muted-foreground/70">
                  Not earned yet
                </Badge>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <MousePointerClick className="w-3 h-3" />
                  <span>Click to start</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      </Card>
      </BadgeTooltip>

      {/* Challenge Modal */}
      {!earned && userId && (
        <BadgeChallengeModal
          isOpen={showChallengeModal}
          onClose={() => setShowChallengeModal(false)}
          badge={{
            id,
            name,
            description,
            icon,
            tier: tier || 'bronze',
            points_reward: points_reward || 0,
            category: category || 'general',
            criteria: { type: 'general', tasks: [], total_steps: 1 },
            is_active: true,
            display_order: 0
          } as BadgeDefinition}
          userId={userId}
        />
      )}
    </>
  );
};