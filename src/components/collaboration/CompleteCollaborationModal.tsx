import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCollaborationCompletion } from "@/hooks/useCollaborationCompletion";
import ContentUploadStep from "./ContentUploadStep";
import ReviewStep from "./ReviewStep";
import ConfirmationStep from "./ConfirmationStep";

interface CompleteCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboration: any;
  userId: string;
  userType: 'host' | 'influencer';
  onComplete: () => void;
  isReviewOnly?: boolean;
}

const CompleteCollaborationModal = ({
  isOpen,
  onClose,
  collaboration,
  userId,
  userType,
  onComplete,
  isReviewOnly = false
}: CompleteCollaborationModalProps) => {
  const {
    step,
    goToStep,
    contentData,
    setContentData,
    reviewData,
    setReviewData,
    isSubmitting,
    handleFinalSubmit,
    isHost,
    totalSteps
  } = useCollaborationCompletion({
    collaboration,
    userId,
    userType,
    onComplete,
    onClose,
    isReviewOnly
  });

  const propertyTitle = collaboration?.applications?.properties?.title || "this property";
  const counterpartName = collaboration?.counterpart
    ? `${collaboration.counterpart.first_name || ''} ${collaboration.counterpart.last_name || ''}`.trim() || 'Partner'
    : 'Partner';

  // Step titles differ based on user type
  const stepTitles = isHost
    ? ["Leave Review", "Confirm Completion"]
    : ["Upload Content", "Leave Review", "Confirm Completion"];

  // Map display steps to actual step numbers
  const getDisplayStep = (actualStep: number) => actualStep;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Complete Collaboration</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s === step 
                    ? 'bg-primary text-primary-foreground' 
                    : s < step 
                      ? 'bg-green-600 text-white'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < totalSteps && (
                <div className={`w-12 h-1 mx-1 rounded ${
                  s < step ? 'bg-green-600' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Label */}
        <div className="text-center text-sm text-muted-foreground mb-4">
          Step {step} of {totalSteps}: {stepTitles[step - 1]}
        </div>

        {/* Step Content - Influencer Flow (3 steps) */}
        {!isHost && (
          <>
            {step === 1 && (
              <ContentUploadStep
                contentData={contentData}
                onContentChange={(data) => setContentData(prev => ({ ...prev, ...data }))}
                onContinue={() => goToStep(2)}
                onSkip={() => goToStep(2)}
                propertyTitle={propertyTitle}
              />
            )}

            {step === 2 && (
              <ReviewStep
                reviewData={reviewData}
                onReviewChange={(data) => setReviewData(prev => ({ ...prev, ...data }))}
                onBack={() => goToStep(1)}
                onContinue={() => goToStep(3)}
                revieweeName={counterpartName}
                reviewerType={userType}
              />
            )}

            {step === 3 && (
              <ConfirmationStep
                contentData={contentData}
                reviewData={reviewData}
                onBack={() => goToStep(2)}
                onComplete={handleFinalSubmit}
                isSubmitting={isSubmitting}
                revieweeName={counterpartName}
                isHost={false}
              />
            )}
          </>
        )}

        {/* Step Content - Host Flow (2 steps) */}
        {isHost && (
          <>
            {step === 1 && (
              <ReviewStep
                reviewData={reviewData}
                onReviewChange={(data) => setReviewData(prev => ({ ...prev, ...data }))}
                onBack={onClose}
                onContinue={() => goToStep(2)}
                revieweeName={counterpartName}
                reviewerType={userType}
              />
            )}

            {step === 2 && (
              <ConfirmationStep
                contentData={contentData}
                reviewData={reviewData}
                onBack={() => goToStep(1)}
                onComplete={handleFinalSubmit}
                isSubmitting={isSubmitting}
                revieweeName={counterpartName}
                isHost={true}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CompleteCollaborationModal;
