import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Image, Star, ArrowLeft, Loader2, X } from "lucide-react";
import { ContentData, ReviewData } from "@/hooks/useCollaborationCompletion";

interface ConfirmationStepProps {
  contentData: ContentData;
  reviewData: ReviewData;
  onBack: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
  revieweeName: string;
  isHost?: boolean;
}

const ConfirmationStep = ({
  contentData,
  reviewData,
  onBack,
  onComplete,
  isSubmitting,
  revieweeName,
  isHost = false
}: ConfirmationStepProps) => {
  const hasContent = contentData.file !== null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Confirm Completion</h3>
        <p className="text-sm text-muted-foreground">
          Review your submission before finalizing
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Content Summary - Only show for influencers */}
        {!isHost && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${hasContent ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {hasContent ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Content Delivery</h4>
                  {hasContent ? (
                    <div className="text-sm text-muted-foreground">
                      <p>File: {contentData.file?.name}</p>
                      {contentData.caption && (
                        <p className="mt-1 line-clamp-2">"{contentData.caption}"</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No content uploaded (skipped)
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Review for {revieweeName}</h4>
                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                  <div className="flex items-center gap-2">
                    <span>Overall:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= reviewData.overall
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {reviewData.reviewText && (
                    <p className="line-clamp-2">"{reviewData.reviewText}"</p>
                  )}
                  {reviewData.wouldWorkAgain !== null && (
                    <p>Would work again: {reviewData.wouldWorkAgain ? 'Yes' : 'No'}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          By clicking "Complete Collaboration", you confirm that:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>The collaboration has been fulfilled</li>
          <li>Your review is honest and accurate</li>
          <li>This action cannot be undone</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onComplete}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Collaboration
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
