import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle2, XCircle, ChevronDown, TrendingUp, DollarSign, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface Recommendation {
  id: string;
  category: 'content_strategy' | 'growth' | 'monetization';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionSteps: string[];
  expectedImpact: string;
  timeline: string;
  confidence?: number;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onMarkDone: (id: string) => void;
  onDismiss: (id: string) => void;
}

const priorityColors = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-foreground',
  low: 'bg-muted text-muted-foreground',
};

const categoryIcons = {
  content_strategy: Lightbulb,
  growth: TrendingUp,
  monetization: DollarSign,
};

const categoryLabels = {
  content_strategy: 'Content Strategy',
  growth: 'Growth',
  monetization: 'Monetization',
};

export const RecommendationCard = ({ recommendation, onMarkDone, onDismiss }: RecommendationCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const CategoryIcon = categoryIcons[recommendation.category];

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={priorityColors[recommendation.priority]}>
                {recommendation.priority.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CategoryIcon className="w-3 h-3" />
                {categoryLabels[recommendation.category]}
              </Badge>
              {recommendation.confidence && recommendation.confidence >= 0.7 && (
                <Badge variant="secondary">
                  {Math.round(recommendation.confidence * 100)}% confident
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{recommendation.title}</CardTitle>
            <CardDescription className="mt-2">
              {recommendation.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Action Steps</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <ol className="space-y-2 ml-4 list-decimal">
              {recommendation.actionSteps.map((step, i) => (
                <li key={i} className="text-sm text-muted-foreground">{step}</li>
              ))}
            </ol>
          </CollapsibleContent>
        </Collapsible>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Expected Impact</p>
            <p className="text-sm font-medium">{recommendation.expectedImpact}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Timeline</p>
            <p className="text-sm font-medium">{recommendation.timeline}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={() => onMarkDone(recommendation.id)}
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as Done
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={() => onDismiss(recommendation.id)}
          >
            <XCircle className="w-4 h-4" />
            Not Relevant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};