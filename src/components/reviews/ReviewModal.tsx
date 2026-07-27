import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User, MessageSquare, Award, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboration: any;
  revieweeId: string;
  revieweeName: string;
  reviewerType: 'host' | 'influencer';
  onReviewSubmitted: () => void;
}

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  collaboration, 
  revieweeId, 
  revieweeName, 
  reviewerType,
  onReviewSubmitted 
}: ReviewModalProps) => {
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
    quality: reviewerType === 'host' ? "Content Quality" : "Property/Service Quality",
    professionalism: "Professionalism"
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
      const { error } = await supabase
        .from('reviews_and_ratings')
        .insert({
          agreement_id: collaboration.id,
          reviewer_id: collaboration[reviewerType === 'host' ? 'host_id' : 'influencer_id'],
          reviewee_id: revieweeId,
          reviewer_type: reviewerType,
          rating: ratings.overall,
          communication_rating: ratings.communication || null,
          quality_rating: ratings.quality || null,
          professionalism_rating: ratings.professionalism || null,
          review_text: reviewText.trim() || null,
          would_work_again: wouldWorkAgain
        });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

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
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-400'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-brand-green" />
            <span>Review {revieweeName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Categories */}
          <div className="space-y-4">
            {Object.entries(ratingLabels).map(([key, label]) => (
              <Card key={key} className="border-l-4 border-l-brand-green">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {key === 'overall' && <Award className="w-4 h-4 text-brand-green" />}
                      {key === 'communication' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                      {key === 'quality' && <Star className="w-4 h-4 text-purple-500" />}
                      {key === 'professionalism' && <User className="w-4 h-4 text-orange-500" />}
                      <span className="font-medium">{label}</span>
                      {key === 'overall' && <span className="text-red-500">*</span>}
                    </div>
                    <StarRating
                      rating={ratings[key as keyof typeof ratings]}
                      onRatingChange={(rating) => handleStarClick(key as keyof typeof ratings, rating)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Written Review */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
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
            <label className="block text-sm font-medium text-gray-700">
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
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || ratings.overall === 0}
              className="flex-1 bg-brand-green hover:bg-brand-green/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;