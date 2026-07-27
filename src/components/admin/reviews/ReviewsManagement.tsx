import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Search, Filter, RefreshCcw, Download, MessageSquare, Flag, EyeOff } from "lucide-react";
import { ReviewStatsCard } from "./ReviewStatsCard";
import { RatingDistributionChart } from "./RatingDistributionChart";
import { FlaggedReviewsTable } from "./FlaggedReviewsTable";
import { ReviewDetailModal } from "./ReviewDetailModal";
import { useReviews } from "@/hooks/useReviews";
import { formatDistanceToNow } from "date-fns";

export const ReviewsManagement = () => {
  const [filters, setFilters] = useState({
    search: '',
    rating: undefined as number | undefined,
    status: 'all' as 'all' | 'flagged' | 'hidden' | 'public',
    reviewerType: 'all' as 'all' | 'host' | 'influencer'
  });

  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { reviews, loading, stats, flagReview, unflagReview, hideReview, unhideReview, updateAdminNotes, refetch } = useReviews(filters);

  const handleViewDetails = (review: any) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Reviewer', 'Reviewee', 'Rating', 'Status', 'Review Text'];
    const rows = reviews.map(r => [
      new Date(r.created_at).toLocaleDateString(),
      `${r.reviewer?.first_name} ${r.reviewer?.last_name}`,
      `${r.reviewee?.first_name} ${r.reviewee?.last_name}`,
      r.rating,
      r.is_hidden ? 'Hidden' : r.is_flagged ? 'Flagged' : 'Active',
      r.review_text || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReviewStatsCard
          title="Total Reviews"
          value={stats.total}
          icon={MessageSquare}
        />
        <ReviewStatsCard
          title="Average Rating"
          value={`${stats.averageRating} / 5`}
          icon={Star}
        />
        <ReviewStatsCard
          title="Flagged Reviews"
          value={stats.flagged}
          icon={Flag}
          className={stats.flagged > 0 ? 'border-red-200 dark:border-red-800' : ''}
        />
        <ReviewStatsCard
          title="Hidden Reviews"
          value={stats.hidden}
          icon={EyeOff}
        />
      </div>

      {/* Rating Distribution */}
      <RatingDistributionChart distribution={stats.ratingDistribution} />

      {/* Flagged Reviews Priority */}
      {stats.flagged > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Flag className="w-5 h-5" />
              Flagged Reviews Requiring Attention ({stats.flagged})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FlaggedReviewsTable
              reviews={reviews}
              onViewDetails={handleViewDetails}
              onUnflag={unflagReview}
              onHide={(id) => hideReview(id, 'Flagged content - hidden by admin')}
            />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              All Reviews
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search reviews..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value: any) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.reviewerType}
              onValueChange={(value: any) => setFilters({ ...filters, reviewerType: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Reviewer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="host">Host</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.rating?.toString() || 'all'}
              onValueChange={(value) => setFilters({ ...filters, rating: value === 'all' ? undefined : parseInt(value) })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reviews Table */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No reviews found</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Reviewee</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow
                      key={review.id}
                      className={review.is_flagged ? 'bg-red-50 dark:bg-red-950/10' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={review.reviewer?.profile_photo_url} />
                            <AvatarFallback>
                              {review.reviewer?.first_name?.[0]}{review.reviewer?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {review.reviewer?.first_name} {review.reviewer?.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={review.reviewee?.profile_photo_url} />
                            <AvatarFallback>
                              {review.reviewee?.first_name?.[0]}{review.reviewee?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{review.reviewee?.first_name} {review.reviewee?.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          ))}
                          <span className="ml-1 text-sm text-muted-foreground">
                            {review.rating}/5
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{review.reviewer_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {review.is_flagged && <Badge variant="destructive">Flagged</Badge>}
                          {review.is_hidden && <Badge variant="secondary">Hidden</Badge>}
                          {!review.is_flagged && !review.is_hidden && review.is_public && (
                            <Badge>Public</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(review)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onFlag={flagReview}
        onUnflag={unflagReview}
        onHide={hideReview}
        onUnhide={unhideReview}
        onUpdateNotes={updateAdminNotes}
      />
    </div>
  );
};
