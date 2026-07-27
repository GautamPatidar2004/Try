import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import { useCreatorGoals } from '@/hooks/useCreatorGoals';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GoalTrackerProps {
  userId: string;
}

export const GoalTracker = ({ userId }: GoalTrackerProps) => {
  const { goals, isLoading, createGoal } = useCreatorGoals(userId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'followers',
    target_value: 0,
    deadline: '',
  });

  const handleCreateGoal = () => {
    createGoal(newGoal);
    setIsDialogOpen(false);
    setNewGoal({ goal_type: 'followers', target_value: 0, deadline: '' });
  };

  const getGoalProgress = (goal: any) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'followers':
        return <TrendingUp className="w-4 h-4" />;
      case 'engagement_rate':
        return <Target className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading goals...</div>;
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Goals</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Goal Type</Label>
                  <Select
                    value={newGoal.goal_type}
                    onValueChange={(value) =>
                      setNewGoal({ ...newGoal, goal_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="followers">Followers</SelectItem>
                      <SelectItem value="engagement_rate">Engagement Rate</SelectItem>
                      <SelectItem value="earnings">Earnings</SelectItem>
                      <SelectItem value="content_count">Content Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Value</Label>
                  <Input
                    type="number"
                    value={newGoal.target_value}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, target_value: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, deadline: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleCreateGoal} className="w-full">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals?.map((goal: any) => (
            <div key={goal.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getGoalIcon(goal.goal_type)}
                  </div>
                  <div>
                    <p className="font-medium capitalize">
                      {goal.goal_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()}
                    </p>
                  </div>
                </div>
                {goal.deadline && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
              <Progress value={getGoalProgress(goal)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {getGoalProgress(goal).toFixed(1)}% complete
              </p>
            </div>
          ))}

          {(!goals || goals.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No goals set yet</p>
              <p className="text-sm mt-1">Create your first goal to track your progress</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};