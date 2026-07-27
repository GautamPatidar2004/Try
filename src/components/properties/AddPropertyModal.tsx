
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertyFormSchema, PropertyFormData } from "./propertyFormSchema";
import BasicInfoStep from "./steps/BasicInfoStep";
import PropertyDetailsStep from "./steps/PropertyDetailsStep";
import CollaborationStep from "./steps/CollaborationStep";
import ImageUploadStep from "./steps/ImageUploadStep";
import { usePropertySubmission } from "./usePropertySubmission";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostId: string;
  onPropertyAdded: () => void;
}

const STEPS = [
  { id: 1, title: "Basic Information", component: BasicInfoStep },
  { id: 2, title: "Property Details", component: PropertyDetailsStep },
  { id: 3, title: "Collaboration Settings", component: CollaborationStep },
  { id: 4, title: "Upload Images", component: ImageUploadStep },
];

const AddPropertyModal = ({ isOpen, onClose, hostId, onPropertyAdded }: AddPropertyModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const { toast } = useToast();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      property_type: "",
      max_guests: 1,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
      content_requirements: [],
      campaign_rate: undefined,
    },
  });

  const { submitProperty, isLoading, isSubmitting } = usePropertySubmission({
    onSuccess: () => {
      onPropertyAdded();
      onClose();
      form.reset();
      setCurrentStep(1);
      setUploadedImages([]);
      setPrimaryImageIndex(0);
    },
  });

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = async () => {
    // Validate only the fields relevant to the current step
    let fieldsToValidate: string[] = [];
    
    switch (currentStep) {
      case 1: // Basic Information
        fieldsToValidate = ["title", "location", "property_type"];
        break;
      case 2: // Property Details
        fieldsToValidate = ["max_guests", "bedrooms", "bathrooms"];
        break;
      case 3: // Collaboration Settings
        fieldsToValidate = ["collaboration_type", "campaign_rate"];
        break;
      case 4: // Upload Images
        // Mandatory validation - require at least one image
        if (uploadedImages.length === 0) {
          alert('Please upload at least one image of your property before proceeding.');
          return;
        }
        break;
    }
    
    const isValid = fieldsToValidate.length === 0 || await form.trigger(fieldsToValidate as any);
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: PropertyFormData) => {
    if (currentStep === STEPS.length) {
      if (uploadedImages.length === 0) {
        toast({
          title: "Images Required",
          description: "Please upload at least one image of your property before creating.",
          variant: "destructive",
        });
        return;
      }
      await submitProperty({
        ...data,
        hostId,
        images: uploadedImages,
        primaryImageIndex,
      });
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setCurrentStep(1);
    setUploadedImages([]);
    setPrimaryImageIndex(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{STEPS[currentStep - 1].title}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <CurrentStepComponent
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
              primaryImageIndex={primaryImageIndex}
              setPrimaryImageIndex={setPrimaryImageIndex}
            />

            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Next"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading || isSubmitting} className="bg-brand-green hover:bg-brand-green/90">
                  {isLoading || isSubmitting ? "Creating Property..." : "Create Property"}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default AddPropertyModal;
