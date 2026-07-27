import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { useAcceptApplication, useRejectApplication } from '@/hooks/useBrandCampaignApplications';
import { ApplicationDetailModal } from '@/components/applications/ApplicationDetailModal';

interface ApplicationCardProps {
  application: any;
}

export const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();

  const influencer = application.influencers;
  const profile = influencer?.profiles;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-yellow-500 text-white';
    }
  };

  const handleAccept = () => {
    setDetailModalOpen(false);
    acceptMutation.mutate(application.id);
  };

  const handleRejectClick = () => {
    setDetailModalOpen(false);
    setRejectDialogOpen(true);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      return;
    }
    rejectMutation.mutate({
      applicationId: application.id,
      rejectionReason: rejectionReason,
    });
    setRejectDialogOpen(false);
    setRejectionReason('');
  };

  return (
    <>
      <Card 
        className="hover-lift cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setDetailModalOpen(true)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.profile_photo_url} />
              <AvatarFallback>
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {profile?.first_name} {profile?.last_name}
                  </h3>
                  {profile?.username && (
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  )}
                </div>
                <Badge className={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span>
                  <strong>{application.follower_count_snapshot?.toLocaleString() || influencer?.total_followers?.toLocaleString() || 'N/A'}</strong> followers
                </span>
                <span>
                  <strong>{application.engagement_rate_snapshot || influencer?.engagement_rate || 'N/A'}%</strong> engagement
                </span>
              </div>

              {application.cover_letter && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {application.cover_letter}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        application={application}
        onApprove={handleAccept}
        onReject={handleRejectClick}
        isApproving={acceptMutation.isPending}
        applicationType="brand"
      />

      {/* Rejection Reason Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this application. This will help the influencer improve future applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
