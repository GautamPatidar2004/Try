import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReviewCard from "./ReviewCard";

interface ReviewsListProps {
  userId: string;
  userType: 'host' | 'influencer';
  showStats?: boolean;
}

const ReviewsList = ({ userId, userType, showStats = true }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    wouldWorkAgainPercentage: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [userId, userType]);

  const fetchReviews = async () => {
    try {
      // Fetch reviews where the user is the reviewee
      const { data, error } = await supabase
        .from('reviews_and_ratings')
        .select(`
          *,
          collaboration_agreements!inner(
            ${userType === 'host' ? 'host_id' : 'influencer_id'}
          )
        `)
        .eq('reviewee_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch reviewer profiles
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, profile_photo_url')
            .eq('id', review.reviewer_id)
            .maybeSingle();

          return {
            ...review,
            reviewer: profileData || {}
          };
        })
      );

      setReviews(reviewsWithProfiles);
      calculateStats(reviewsWithProfiles);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData: any[]) => {
    if (reviewsData.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        wouldWorkAgainPercentage: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviewsData.length;

    const wouldWorkAgainCount = reviewsData.filter(review => review.would_work_again === true).length;
    const wouldWorkAgainTotal = reviewsData.filter(review => review.would_work_again !== null).length;
    const wouldWorkAgainPercentage = wouldWorkAgainTotal > 0 ? (wouldWorkAgainCount / wouldWorkAgainTotal) * 100 : 0;

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach(review => {
      ratingBreakdown[review.rating as keyof typeof ratingBreakdown]++;
    });

    setStats({
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviewsData.length,
      wouldWorkAgainPercentage: Math.round(wouldWorkAgainPercentage),
      ratingBreakdown
    });
  };

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : star === Math.ceil(rating) && rating % 1 !== 0
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {showStats && stats.totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall Rating */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-3xl font-bold text-gray-900">{stats.averageRating}</span>
              </div>
              <StarDisplay rating={stats.averageRating} />
              <p className="text-sm text-gray-600 mt-2">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {/* Would Work Again */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <span className="text-3xl font-bold text-green-600">{stats.wouldWorkAgainPercentage}%</span>
              </div>
              <p className="text-sm text-gray-600">
                Would work together again
              </p>
            </CardContent>
          </Card>

          {/* Review Distribution */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-4">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: stats.totalReviews > 0 
                            ? `${(stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown] / stats.totalReviews) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-6">
                      {stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Reviews {stats.totalReviews > 0 && `(${stats.totalReviews})`}
          </h3>
          {stats.totalReviews > 0 && (
            <Badge variant="secondary" className="bg-brand-green/10 text-brand-green">
              {userType === 'host' ? 'Host Reviews' : 'Creator Reviews'}
            </Badge>
          )}
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Reviews from completed collaborations will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} showReviewerInfo={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;