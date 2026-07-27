import { BadgeCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  size?: "xs" | "sm" | "md";
  showTooltip?: boolean;
  className?: string;
}

export const VerificationBadge = ({ 
  size = "sm", 
  showTooltip = true,
  className 
}: VerificationBadgeProps) => {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  const badge = (
    <BadgeCheck 
      className={cn(
        "text-green-600 fill-green-100 flex-shrink-0",
        sizeClasses[size],
        className
      )}
      aria-label="Verified account"
    />
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p>Verified Account</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};
