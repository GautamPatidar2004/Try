import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EditPropertyNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLoadingImages?: boolean;
  isSubmitting?: boolean;
}

const EditPropertyNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isLoadingImages = false,
  isSubmitting = false,
}: EditPropertyNavigationProps) => {
  return (
    <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

      {currentStep < totalSteps ? (
        <Button 
          type="button" 
          onClick={onNext}
          disabled={isLoadingImages || isSubmitting}
        >
          {isLoadingImages ? "Loading..." : isSubmitting ? "Saving..." : "Next"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button 
          type="submit" 
          className="bg-brand-green hover:bg-brand-green/90"
          onClick={onSubmit}
          disabled={isLoadingImages || isSubmitting}
        >
          {isLoadingImages || isSubmitting ? "Updating..." : "Update Property"}
        </Button>
      )}
    </div>
  );
};

export default EditPropertyNavigation;