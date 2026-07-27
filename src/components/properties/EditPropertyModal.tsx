import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FormProvider } from "react-hook-form";
import { EDIT_PROPERTY_STEPS, getFieldsToValidate } from "./editPropertySteps";
import { useEditPropertyForm } from "./hooks/useEditPropertyForm";
import EditPropertyHeader from "./components/EditPropertyHeader";
import EditPropertyNavigation from "./components/EditPropertyNavigation";

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onPropertyUpdated: () => void;
}

const EditPropertyModal = ({ isOpen, onClose, property, onPropertyUpdated }: EditPropertyModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  const {
    form,
    uploadedImages,
    setUploadedImages,
    primaryImageIndex,
    setPrimaryImageIndex,
    existingImages,
    onSetExistingPrimary,
    onRemoveExistingImage,
    isLoadingImages,
    imageLoadError,
    isSubmitting,
    handleSubmit,
    handleClose,
  } = useEditPropertyForm({
    property,
    isOpen,
    onPropertyUpdated,
    onClose,
  });

  const CurrentStepComponent = EDIT_PROPERTY_STEPS[currentStep - 1].component;

  const handleNext = async () => {
    if (isLoadingImages) {
      alert('Please wait while existing images are loading...');
      return;
    }

    if (currentStep === 4) {
      if (imageLoadError && uploadedImages.length === 0) {
        alert('Failed to load existing images and no new images uploaded. Please upload at least one image to proceed.');
        return;
      }
      
      const totalImages = existingImages.length + uploadedImages.length;
      if (totalImages === 0) {
        alert('Please upload at least one image of your property before proceeding.');
        return;
      }
    }

    if (currentStep === 3 && isLoadingImages) {
      alert('Please wait while existing images are loading before proceeding to image upload...');
      return;
    }

    const fieldsToValidate = getFieldsToValidate(currentStep);
    const isValid = fieldsToValidate.length === 0 || await form.trigger(fieldsToValidate as any);
    
    if (isValid && currentStep < EDIT_PROPERTY_STEPS.length) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 100);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = () => {
    if (currentStep === EDIT_PROPERTY_STEPS.length) {
      form.handleSubmit(handleSubmit)();
    }
  };

  const resetModal = () => {
    handleClose();
    setCurrentStep(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <EditPropertyHeader
          currentStep={currentStep}
          totalSteps={EDIT_PROPERTY_STEPS.length}
          stepTitle={EDIT_PROPERTY_STEPS[currentStep - 1].title}
        />

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <CurrentStepComponent
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
              primaryImageIndex={primaryImageIndex}
              setPrimaryImageIndex={setPrimaryImageIndex}
              existingImages={existingImages}
              onSetExistingPrimary={onSetExistingPrimary}
              onRemoveExistingImage={onRemoveExistingImage}
              isLoadingImages={isLoadingImages}
              imageLoadError={imageLoadError}
            />

            <EditPropertyNavigation
              currentStep={currentStep}
              totalSteps={EDIT_PROPERTY_STEPS.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={handleFormSubmit}
              isLoadingImages={isLoadingImages}
              isSubmitting={isSubmitting}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default EditPropertyModal;