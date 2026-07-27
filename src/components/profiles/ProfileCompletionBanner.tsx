import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileCompletionBannerProps {
  completionScore: number;
  missingFields: string[];
  userId: string;
}

export const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({
  completionScore,
  missingFields,
  userId
}) => {
  const navigate = useNavigate();

  if (completionScore >= 100) {
    return null; // Profile is complete
  }

  return (
    <Alert className="border-warning bg-warning/10 mb-6">
      <AlertCircle className="h-5 w-5 text-warning" />
      <AlertDescription className="ml-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">
                Complete Your Profile ({completionScore}%)
              </p>
              <p className="text-sm text-muted-foreground">
                Incomplete profiles get 10x fewer opportunities
              </p>
            </div>
            <Button
              onClick={() => navigate('/profile')}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              Complete Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Progress value={completionScore} className="h-2" />
          
          {missingFields.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Missing:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
