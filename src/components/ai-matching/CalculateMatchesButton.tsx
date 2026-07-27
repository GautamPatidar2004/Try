import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CalculateMatchesButtonProps {
  propertyId: string;
  propertyTitle: string;
  onComplete?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  fullWidth?: boolean;
}

const CalculateMatchesButton = ({ 
  propertyId, 
  propertyTitle,
  onComplete,
  variant = "outline",
  size = "sm",
  fullWidth = false
}: CalculateMatchesButtonProps) => {
  const [calculating, setCalculating] = useState(false);
  const { toast } = useToast();

  const handleCalculate = async () => {
    setCalculating(true);
    
    try {
      // Fetch all active influencers
      const { data: influencers, error: influencersError } = await supabase
        .from('influencers')
        .select('id')
        .limit(50); // Limit to prevent too many API calls

      if (influencersError) throw influencersError;

      if (!influencers || influencers.length === 0) {
        toast({
          title: "No creators found",
          description: "There are no active creators to match with.",
          variant: "destructive"
        });
        return;
      }

      let successCount = 0;
      let failCount = 0;

      // Calculate matches for each influencer
      for (const influencer of influencers) {
        try {
          const { error } = await supabase.functions.invoke('calculate-ai-match', {
            body: { 
              influencerId: influencer.id, 
              propertyId: propertyId 
            }
          });

          if (error) {
            failCount++;
          } else {
            successCount++;
          }
        } catch {
          failCount++;
        }
      }

      toast({
        title: "Matches calculated!",
        description: `Found ${successCount} potential matches for ${propertyTitle}`,
      });

      onComplete?.();
    } catch (error) {
      console.error('Error calculating matches:', error);
      toast({
        title: "Error",
        description: "Failed to calculate matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCalculate}
      disabled={calculating}
      className={fullWidth ? "w-full" : ""}
    >
      {calculating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Calculating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Calculate Matches
        </>
      )}
    </Button>
  );
};

export default CalculateMatchesButton;
