import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Award, ArrowRight } from 'lucide-react';
import { useBadgeChallenge } from '@/hooks/useBadgeChallenge';
import { BadgeDefinition } from '@/types/badge';

interface BadgeChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: BadgeDefinition;
  userId: string;
}

export const BadgeChallengeModal = ({ isOpen, onClose, badge, userId }: BadgeChallengeModalProps) => {
  const navigate = useNavigate();
  const { challenge, progress, loading, startChallenge, updateTaskProgress } = useBadgeChallenge(userId, badge.id);
  const [actionLoading, setActionLoading] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'bronze': return 'bg-gradient-to-r from-amber-600 to-amber-800';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'platinum': return 'bg-gradient-to-r from-cyan-400 to-blue-600';
      default: return 'bg-gradient-to-r from-primary to-primary/80';
    }
  };

  const handleStartChallenge = async () => {
    setActionLoading(true);
    await startChallenge();
    setActionLoading(false);
  };

  const handleTaskAction = (route?: string) => {
    if (route) {
      navigate(route);
      onClose();
    }
  };

  const tasks = badge.criteria?.tasks || [];
  const completedTasks = Object.values(challenge?.steps_data || {}).filter(Boolean).length;
  const progressPercentage = progress?.progress_percentage || 0;
  const isCompleted = progressPercentage >= 100;
  const hasStarted = challenge?.status === 'in_progress' || challenge?.status === 'completed';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-xl ${getTierColor(badge.tier)} text-white`}>
              <span className="text-4xl">{badge.icon}</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2 flex items-center gap-2">
                {badge.name}
                <Badge variant="secondary" className="text-xs">
                  {badge.tier}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-base">
                {badge.description}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2 text-sm text-primary font-semibold">
                <Award className="w-4 h-4" />
                +{badge.points_reward} points
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">
                {completedTasks}/{tasks.length} tasks completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-right text-sm text-muted-foreground">
              {progressPercentage}%
            </div>
          </div>

          {/* Tasks Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Challenge Tasks</h3>
            <div className="space-y-2">
              {tasks.map((task) => {
                const isTaskCompleted = challenge?.steps_data?.[task.id] || false;
                
                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                      isTaskCompleted 
                        ? 'bg-success/10 border-success/20' 
                        : 'bg-card border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="pt-0.5">
                      {isTaskCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${isTaskCompleted ? 'text-success' : ''}`}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                      {!isTaskCompleted && hasStarted && task.route && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => handleTaskAction(task.route)}
                        >
                          {task.action}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completion Message */}
          {isCompleted && (
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 text-success font-semibold">
                <Award className="w-5 h-5" />
                Challenge Complete! Badge has been awarded.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!hasStarted && !isCompleted && (
            <Button onClick={handleStartChallenge} disabled={actionLoading || loading}>
              {actionLoading ? 'Starting...' : 'Accept Challenge'}
            </Button>
          )}
          {hasStarted && !isCompleted && (
            <Button onClick={onClose}>
              Continue Challenge
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
