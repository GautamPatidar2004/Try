import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface EditPropertyHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

const EditPropertyHeader = ({ currentStep, totalSteps, stepTitle }: EditPropertyHeaderProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <DialogHeader>
      <DialogTitle>Edit Property</DialogTitle>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{stepTitle}</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>
    </DialogHeader>
  );
};

export default EditPropertyHeader;