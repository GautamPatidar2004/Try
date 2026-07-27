import { Star, ThumbsUp, ThumbsDown, MessageSquare, User, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    communication_rating?: number;
    quality_rating?: number;
    professionalism_rating?: number;
    review_text?: string;
    would_work_again?: boolean;
    reviewer_type: 'host' | 'influencer';
    created_at: string;
    reviewer: {
      first_name?: string;
      last_name?: string;
      profile_photo_url?: string;
    };
  };
  showReviewerInfo?: boolean;
}

const ReviewCard = ({ review, showReviewerInfo = true }: ReviewCardProps) => {
  const getInitials = () => {
    const first = review.reviewer.first_name?.[0] || '';
    const last = review.reviewer.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const StarDisplay = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => (
    <div className={`flex space-x-0.5 ${size === "md" ? "space-x-1" : ""}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size === "md" ? "w-4 h-4" : "w-3 h-3"} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with reviewer info and overall rating */}
          <div className="flex items-start justify-between">
            {showReviewerInfo && (
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.reviewer.profile_photo_url} />
                  <AvatarFallback className="text-sm">{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900">
                    {review.reviewer.first_name} {review.reviewer.last_name}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {review.reviewer_type === 'host' ? 'Host' : 'Creator'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <StarDisplay rating={review.rating} size="md" />
              <span className="font-bold text-lg text-gray-900">{review.rating}.0</span>
            </div>
          </div>

          {/* Detailed ratings */}
          {(review.communication_rating || review.quality_rating || review.professionalism_rating) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 border-t border-b border-gray-100">
              {review.communication_rating && (
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Communication</span>
                  <StarDisplay rating={review.communication_rating} />
                </div>
              )}
              {review.quality_rating && (
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Quality</span>
                  <StarDisplay rating={review.quality_rating} />
                </div>
              )}
              {review.professionalism_rating && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">Professional</span>
                  <StarDisplay rating={review.professionalism_rating} />
                </div>
              )}
            </div>
          )}

          {/* Review text */}
          {review.review_text && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
            </div>
          )}

          {/* Would work again indicator */}
          {review.would_work_again !== null && (
            <div className="flex items-center space-x-2">
              {review.would_work_again ? (
                <>
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    Would work together again
                  </span>
                </>
              ) : (
                <>
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    Would not work together again
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;