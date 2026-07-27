import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

interface AIMatchButtonProps {
  onCalculate: () => Promise<void>;
  isCalculating?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const AIMatchButton = ({ 
  onCalculate, 
  isCalculating = false,
  variant = "outline",
  size = "sm"
}: AIMatchButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onCalculate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading || isCalculating}
      className="gap-2"
    >
      {loading || isCalculating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Calculating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Calculate AI Match
        </>
      )}
    </Button>
  );
};

export default AIMatchButton;