import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCreatorReviews } from "@/hooks/useCreatorReviews";
import ReviewCard from "@/components/reviews/ReviewCard";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioReviewsProps {
  creatorId: string;
}

export const PortfolioReviews = ({ creatorId }: PortfolioReviewsProps) => {
  const { reviews, averageRating, totalReviews, wouldWorkAgainPercentage, loading, error } = useCreatorReviews(creatorId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Failed to load reviews. Please try again later.</p>
      </div>
    );
  }

  if (totalReviews === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No Reviews Yet"
        description="This creator hasn't received any reviews from hosts or brands yet. Reviews will appear here after successful collaborations."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Star className="w-5 h-5 text-primary fill-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{averageRating}</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-secondary rounded-full">
              <MessageSquare className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalReviews}</p>
              <p className="text-sm text-muted-foreground">
                {totalReviews === 1 ? 'Review' : 'Reviews'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-accent rounded-full">
              <ThumbsUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{wouldWorkAgainPercentage}%</p>
              <p className="text-sm text-muted-foreground">Would Work Again</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Host & Brand Reviews</h3>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showReviewerInfo={true}
          />
        ))}
      </div>
    </div>
  );
};
