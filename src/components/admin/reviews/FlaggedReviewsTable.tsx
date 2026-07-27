import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flag, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FlaggedReviewsTableProps {
  reviews: any[];
  onViewDetails: (review: any) => void;
  onUnflag: (reviewId: string) => void;
  onHide: (reviewId: string) => void;
}

export const FlaggedReviewsTable = ({ 
  reviews, 
  onViewDetails, 
  onUnflag,
  onHide 
}: FlaggedReviewsTableProps) => {
  const flaggedReviews = reviews.filter(r => r.is_flagged && !r.is_hidden);

  if (flaggedReviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Flag className="w-12 h-12 mx-auto mb-2 opacity-20" />
        <p>No flagged reviews requiring attention</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reviewer</TableHead>
            <TableHead>Reviewee</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Flag Reason</TableHead>
            <TableHead>Flagged</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flaggedReviews.map((review) => (
            <TableRow key={review.id} className="bg-red-50 dark:bg-red-950/20">
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
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                  <span className="ml-1 text-sm text-muted-foreground">
                    {review.rating}/5
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="destructive" className="max-w-[200px]">
                  {review.flag_reason || 'No reason provided'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.flagged_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(review)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUnflag(review.id)}
                  >
                    Remove Flag
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onHide(review.id)}
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
