import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const PillChip = ({
  children,
  className,
  variant = "mint",
}: {
  children: ReactNode;
  className?: string;
  variant?: "mint" | "white" | "dark";
}) => {
  const styles = {
    // Use foreground tokens so text remains legible in both light & dark modes.
    mint: "bg-brand-green/10 text-foreground border border-brand-green/30 dark:bg-brand-green/15 dark:text-brand-green dark:border-brand-green/40",
    white: "bg-card text-card-foreground border border-border",
    dark: "bg-foreground text-background border border-foreground",
  }[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide",
        styles,
        className
      )}
    >
      {children}
    </span>
  );
};

export const SquircleIcon = ({
  children,
  className,
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "h-10 w-10 text-base rounded-[0.9rem]",
    md: "h-12 w-12 text-lg rounded-[1.1rem]",
    lg: "h-14 w-14 text-xl rounded-[1.25rem]",
  }[size];
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center bg-brand-green/10 text-brand-green font-semibold",
        sizes,
        className
      )}
    >
      {children}
    </div>
  );
};

export const LiveDot = () => (
  <span className="relative inline-flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-75" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-green" />
  </span>
);
