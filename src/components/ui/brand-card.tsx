import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

interface BrandCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glow" | "gradient" | "elevated" | "accent" | "default";
}

export const BrandCard = forwardRef<HTMLDivElement, BrandCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-card border border-border shadow-sm",
      glow: "bg-card border border-brand-green/20 shadow-lg hover:shadow-[0_0_30px_hsl(var(--hostfluencer-green)/0.15)] transition-shadow duration-300",
      gradient: "bg-gradient-to-br from-brand-green/5 via-card to-brand-blush/10 border border-brand-green/10",
      elevated: "bg-card border border-border shadow-xl hover:shadow-2xl transition-shadow duration-300",
      accent: "bg-card border-2 border-brand-blush shadow-sm hover:border-brand-green/30 transition-colors duration-300",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl p-6 overflow-hidden",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BrandCard.displayName = "BrandCard";

// Stat card for earnings/metrics display
export const StatCard = forwardRef<HTMLDivElement, BrandCardProps & { highlight?: boolean }>(
  ({ className, highlight, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl p-4 transition-all duration-300",
          highlight
            ? "bg-gradient-to-br from-brand-green to-brand-accent text-white shadow-lg"
            : "bg-card border border-border hover:border-brand-green/20",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

StatCard.displayName = "StatCard";
