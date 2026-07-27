import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Flag, EyeOff, Eye, FileText, User, Star } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface ReviewDetailModalProps {
  review: any;
  open: boolean;
  onClose: () => void;
  onFlag: (reviewId: string, reason: string) => void;
  onUnflag: (reviewId: string) => void;
  onHide: (reviewId: string, notes?: string) => void;
  onUnhide: (reviewId: string) => void;
  onUpdateNotes: (reviewId: string, notes: string) => void;
}

export const ReviewDetailModal = ({
  review,
  open,
  onClose,
  onFlag,
  onUnflag,
  onHide,
  onUnhide,
  onUpdateNotes
}: ReviewDetailModalProps) => {
  const [flagReason, setFlagReason] = useState('');
  const [hideNotes, setHideNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState(review?.admin_notes || '');

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="notes">Admin Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold">{review.rating}/5</span>
                </div>

                {review.review_text && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Review Text</p>
                    <p className="text-sm">{review.review_text}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {review.communication_rating && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Communication</p>
                      <p className="text-sm">{review.communication_rating}/5</p>
                    </div>
                  )}
                  {review.quality_rating && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quality</p>
                      <p className="text-sm">{review.quality_rating}/5</p>
                    </div>
                  )}
                  {review.professionalism_rating && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Professionalism</p>
                      <p className="text-sm">{review.professionalism_rating}/5</p>
                    </div>
                  )}
                  {review.would_work_again !== null && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Would Work Again</p>
                      <Badge variant={review.would_work_again ? "default" : "secondary"}>
                        {review.would_work_again ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{format(new Date(review.created_at), 'PPP p')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Public</span>
                    <Badge variant={review.is_public ? "default" : "secondary"}>
                      {review.is_public ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex gap-2">
                      {review.is_flagged && <Badge variant="destructive">Flagged</Badge>}
                      {review.is_hidden && <Badge variant="secondary">Hidden</Badge>}
                      {!review.is_flagged && !review.is_hidden && <Badge>Active</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parties" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Reviewer</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={review.reviewer?.profile_photo_url} />
                      <AvatarFallback>
                        {review.reviewer?.first_name?.[0]}{review.reviewer?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {review.reviewer?.first_name} {review.reviewer?.last_name}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {review.reviewer_type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Reviewee</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={review.reviewee?.profile_photo_url} />
                      <AvatarFallback>
                        {review.reviewee?.first_name?.[0]}{review.reviewee?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {review.reviewee?.first_name} {review.reviewee?.last_name}
                      </p>
                    </div>
                  </div>
                </div>

                {review.agreement && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Related Agreement</p>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-mono">{review.agreement_id}</span>
                      <Badge>{review.agreement.status}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {review.is_flagged ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <Flag className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-red-900 dark:text-red-100">
                            Review is flagged
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {review.flag_reason || 'No reason provided'}
                          </p>
                          {review.flagged_at && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                              Flagged on {format(new Date(review.flagged_at), 'PPP p')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => onUnflag(review.id)} variant="outline" className="w-full">
                      Remove Flag
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Flag this review</label>
                    <Textarea
                      placeholder="Reason for flagging..."
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={() => {
                        onFlag(review.id, flagReason);
                        setFlagReason('');
                      }}
                      variant="destructive"
                      className="w-full"
                      disabled={!flagReason}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Flag Review
                    </Button>
                  </div>
                )}

                <div className="border-t pt-4">
                  {review.is_hidden ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-3">
                          <EyeOff className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-900 dark:text-yellow-100">
                              Review is hidden from public view
                            </p>
                            {review.admin_reviewed_at && (
                              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                                Hidden on {format(new Date(review.admin_reviewed_at), 'PPP p')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => onUnhide(review.id)} variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Unhide Review
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Hide this review</label>
                      <Textarea
                        placeholder="Optional notes about hiding..."
                        value={hideNotes}
                        onChange={(e) => setHideNotes(e.target.value)}
                        rows={2}
                      />
                      <Button
                        onClick={() => {
                          onHide(review.id, hideNotes);
                          setHideNotes('');
                        }}
                        variant="secondary"
                        className="w-full"
                      >
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide Review
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Admin Notes (Internal Only)</label>
                  <Textarea
                    placeholder="Add internal notes about this review..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={6}
                  />
                  <Button
                    onClick={() => onUpdateNotes(review.id, adminNotes)}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Save Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
