import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  metadata: Record<string, any>;
}

interface BadgeEarnedProps {
  badge: Badge | null;
  onDismiss: () => void;
}

export const BadgeEarned: React.FC<BadgeEarnedProps> = ({ badge, onDismiss }) => {
  if (!badge) return null;

  return (
    <Dialog open={!!badge} onOpenChange={onDismiss}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader className="sr-only">
          <DialogTitle>Badge Earned</DialogTitle>
          <DialogDescription>You've earned a new badge for your progress</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center text-4xl animate-scale-in">
            {badge.icon}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Badge Earned!</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{badge.name}</h3>
            <p className="text-muted-foreground">{badge.description}</p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              🎯 Keep going! You're making great progress on your journey.
            </p>
          </div>

          <Button onClick={onDismiss} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};