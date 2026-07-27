import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes, ReactNode } from "react";

interface AnimatedIconProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  animation?: "pulse" | "bounce" | "glow" | "float" | "none";
  size?: "sm" | "md" | "lg";
}

export const AnimatedIcon = forwardRef<HTMLDivElement, AnimatedIconProps>(
  ({ className, children, animation = "none", size = "md", ...props }, ref) => {
    const animations = {
      none: "",
      pulse: "animate-pulse",
      bounce: "animate-bounce-subtle",
      glow: "animate-glow-pulse",
      float: "animate-float",
    };

    const sizes = {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-full",
          sizes[size],
          animations[animation],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedIcon.displayName = "AnimatedIcon";

// Trophy icon with special styling
export const TrophyIcon = ({ 
  tier, 
  animate = false 
}: { 
  tier: "bronze" | "silver" | "gold" | "platinum"; 
  animate?: boolean;
}) => {
  const tierStyles = {
    bronze: "bg-orange-100 text-orange-600 border-orange-300",
    silver: "bg-gray-100 text-gray-600 border-gray-300",
    gold: "bg-yellow-100 text-yellow-600 border-yellow-300",
    platinum: "bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600 border-purple-300",
  };

  const tierEmoji = {
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
    platinum: "💎",
  };

  return (
    <AnimatedIcon
      animation={animate ? "glow" : "none"}
      size="lg"
      className={cn(
        "border-2",
        tierStyles[tier]
      )}
    >
      <span className="text-2xl">{tierEmoji[tier]}</span>
    </AnimatedIcon>
  );
};
