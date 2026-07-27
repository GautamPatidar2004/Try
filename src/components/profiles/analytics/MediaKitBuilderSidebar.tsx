import { Check, ImageIcon, User, Briefcase, FileText, FolderOpen, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Hero & Profile', icon: ImageIcon },
  { label: 'About You', icon: User },
  { label: 'Services & Rates', icon: Briefcase },
  { label: 'Deliverables', icon: FileText },
  { label: 'Portfolio', icon: FolderOpen },
  { label: 'Brand Collabs', icon: Building2 },
];

interface MediaKitBuilderSidebarProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export const MediaKitBuilderSidebar = ({ currentStep, completedSteps, onStepClick }: MediaKitBuilderSidebarProps) => {
  return (
    <div className="w-64 shrink-0 border-r border-border bg-muted/30 p-4">
      <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">Build Your Media Kit</h3>
      <nav className="space-y-1">
        {STEPS.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = completedSteps.has(index);
          const Icon = step.icon;

          return (
            <button
              key={index}
              onClick={() => onStepClick(index)}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                isActive && 'bg-primary text-primary-foreground',
                !isActive && isCompleted && 'text-foreground hover:bg-muted',
                !isActive && !isCompleted && 'text-muted-foreground hover:bg-muted'
              )}
            >
              <div className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs',
                isActive && 'bg-primary-foreground/20',
                !isActive && isCompleted && 'bg-primary/10 text-primary',
                !isActive && !isCompleted && 'bg-muted'
              )}>
                {isCompleted && !isActive ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span>{step.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
