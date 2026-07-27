import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";
import { useFollows } from "@/hooks/useFollows";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  className?: string;
}

const FollowButton = ({ 
  userId, 
  variant = "outline", 
  size = "default",
  showIcon = true,
  className = ""
}: FollowButtonProps) => {
  const { isFollowing, loading, toggleFollow } = useFollows(userId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollow(userId);
  };

  return (
    <Button
      variant={isFollowing ? "secondary" : variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {showIcon && (
        isFollowing ? (
          <UserCheck className="w-4 h-4 mr-2" />
        ) : (
          <UserPlus className="w-4 h-4 mr-2" />
        )
      )}
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;
