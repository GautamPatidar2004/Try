import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User, MessageSquare, Award, ThumbsUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BrandReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreementId: string;       
  applicationId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeName: string;
  onReviewSubmitted: () => void;
}

const BrandReviewModal = ({ 
  isOpen, 
  onClose, 
  agreementId,
  applicationId,
  reviewerId,
  revieweeId, 
  revieweeName, 
  onReviewSubmitted 
}: BrandReviewModalProps) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    communication: 0,
    quality: 0,
    professionalism: 0
  });
  const [reviewText, setReviewText] = useState("");
  const [wouldWorkAgain, setWouldWorkAgain] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const ratingLabels = {
    overall: "Overall Experience",
    communication: "Communication",
    quality: "Content Quality",
    professionalism: "Professionalism"
  };

  const ratingIcons = {
    overall: <Award className="w-4 h-4 text-primary" />,
    communication: <MessageSquare className="w-4 h-4 text-blue-500" />,
    quality: <Star className="w-4 h-4 text-purple-500" />,
    professionalism: <User className="w-4 h-4 text-orange-500" />
  };

  const handleStarClick = (category: keyof typeof ratings, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = async () => {
    if (ratings.overall === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide an overall rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit the review
      const { error: reviewError } = await supabase
        .from('reviews_and_ratings')
        .insert({
          brand_agreement_id: agreementId,
          agreement_id:null,
          reviewer_id: reviewerId,
          reviewee_id: revieweeId,
          reviewer_type: 'brand',
          rating: ratings.overall,
          communication_rating: ratings.communication || null,
          quality_rating: ratings.quality || null,
          professionalism_rating: ratings.professionalism || null,
          review_text: reviewText.trim() || null,
          would_work_again: wouldWorkAgain
        });

      if (reviewError) throw reviewError;

      // Update application status to completed
      const { error: updateError } = await supabase
        .from('brand_campaign_applications')
        .update({ status: 'completed' })
        .eq('id', applicationId);

      
      if (updateError) throw updateError;
      const { error: agreementError } = await supabase
      .from('brand_collaboration_agreements' as any)
      .update({ status: 'completed' })
      .eq('id', agreementId);
    
    if (agreementError) throw agreementError;

      toast({
        title: "Review Submitted",
        description: "The collaboration has been marked as complete.",
      });

      // Reset form
      setRatings({ overall: 0, communication: 0, quality: 0, professionalism: 0 });
      setReviewText("");
      setWouldWorkAgain(null);

      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/40 hover:text-yellow-400'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-primary" />
            <span>Review {revieweeName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Categories */}
          <div className="space-y-3">
            {(Object.keys(ratingLabels) as Array<keyof typeof ratingLabels>).map((key) => (
              <Card key={key} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {ratingIcons[key]}
                      <span className="font-medium">{ratingLabels[key]}</span>
                      {key === 'overall' && <span className="text-destructive">*</span>}
                    </div>
                    <StarRating
                      rating={ratings[key]}
                      onRatingChange={(rating) => handleStarClick(key, rating)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Written Review */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Written Review (Optional)
            </label>
            <Textarea
              placeholder={`Share your experience working with ${revieweeName}...`}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Would Work Again */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Would you work with {revieweeName} again?
            </label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={wouldWorkAgain === true ? "default" : "outline"}
                onClick={() => setWouldWorkAgain(true)}
                className="flex items-center space-x-2"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Yes</span>
              </Button>
              <Button
                type="button"
                variant={wouldWorkAgain === false ? "default" : "outline"}
                onClick={() => setWouldWorkAgain(false)}
                className="flex items-center space-x-2"
              >
                <ThumbsUp className="w-4 h-4 rotate-180" />
                <span>No</span>
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || ratings.overall === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Complete & Submit Review"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrandReviewModal;
