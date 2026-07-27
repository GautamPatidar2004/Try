import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes, ReactNode } from "react";

interface ResponsiveStackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: "vertical" | "horizontal";
  mobileDirection?: "vertical" | "horizontal";
  gap?: "sm" | "md" | "lg";
}

export const ResponsiveStack = forwardRef<HTMLDivElement, ResponsiveStackProps>(
  ({ 
    className, 
    children, 
    direction = "horizontal", 
    mobileDirection = "vertical",
    gap = "md",
    ...props 
  }, ref) => {
    const gaps = {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
    };

    const directionClasses = {
      vertical: "flex-col",
      horizontal: "flex-row",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          gaps[gap],
          // Mobile direction
          directionClasses[mobileDirection],
          // Desktop direction
          `md:${directionClasses[direction]}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveStack.displayName = "ResponsiveStack";

// Touch-friendly button wrapper
export const TouchTarget = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-[44px] min-w-[44px] flex items-center justify-center",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchTarget.displayName = "TouchTarget";

// Collapsible section for mobile
interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const CollapsibleMobileSection = ({ 
  className, 
  title, 
  defaultOpen = true, 
  icon, 
  children 
}: CollapsibleSectionProps) => {
  return (
    <details 
      open={defaultOpen} 
      className={cn("group", className)}
    >
      <summary className="flex items-center justify-between cursor-pointer list-none p-3 bg-muted/50 rounded-lg mb-2 touch-manipulation">
        <div className="flex items-center gap-2 font-medium">
          {icon}
          {title}
        </div>
        <span className="transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="pl-2 animate-fade-in">
        {children}
      </div>
    </details>
  );
};
