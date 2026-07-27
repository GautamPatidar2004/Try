import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Users, MapPin, DollarSign, Calendar, Pause, Play, XCircle, Loader2 } from 'lucide-react';
import { ApplicationsList } from './ApplicationsList';
import { useGetCampaignApplications } from '@/hooks/useBrandCampaignApplications';
import { useToggleCampaignStatus } from '@/hooks/useBrandCampaignMutations';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BrandCampaignManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: any;
  defaultTab?: 'overview' | 'applications';
}

export const BrandCampaignManagementModal = ({
  open,
  onOpenChange,
  campaign,
  defaultTab = 'overview'
}: BrandCampaignManagementModalProps) => {
  const { data: applications, isLoading } = useGetCampaignApplications(campaign?.id);
  const toggleStatus = useToggleCampaignStatus();
  const [confirmDialog, setConfirmDialog] = useState<{ 
    open: boolean; 
    action: string; 
    status: 'open' | 'paused' | 'closed' | '' 
  }>({
    open: false,
    action: '',
    status: ''
  });

  if (!campaign) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500 text-white';
      case 'paused': return 'bg-yellow-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const handleStatusChange = () => {
    if (!confirmDialog.status) return;
    
    toggleStatus.mutate(
      { id: campaign.id, status: confirmDialog.status as 'open' | 'paused' | 'closed' },
      {
        onSuccess: () => {
          setConfirmDialog({ open: false, action: '', status: '' });
          onOpenChange(false);
        },
        onError: () => {
          setConfirmDialog({ open: false, action: '', status: '' });
        }
      }
    );
  };

  const openStatusDialog = (action: string, status: 'open' | 'paused' | 'closed') => {
    setConfirmDialog({ open: true, action, status });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{campaign.campaign_title}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">
                Applications ({applications?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
                <div className="flex gap-2">
                  {campaign.status === 'open' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openStatusDialog('Pause', 'paused')}
                      disabled={toggleStatus.isPending}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Campaign
                    </Button>
                  )}
                  {campaign.status === 'paused' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openStatusDialog('Resume', 'open')}
                      disabled={toggleStatus.isPending}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Resume Campaign
                    </Button>
                  )}
                  {campaign.status !== 'closed' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openStatusDialog('Close', 'closed')}
                      disabled={toggleStatus.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Close Campaign
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{campaign.views_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Views</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{campaign.applications_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Applications</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{campaign.spots_filled || 0}/{campaign.spots_available || 0}</p>
                    <p className="text-sm text-muted-foreground">Spots Filled</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold capitalize">{campaign.compensation_type}</p>
                    <p className="text-sm text-muted-foreground">Compensation</p>
                  </CardContent>
                </Card>
              </div>

              {/* Campaign Details */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{campaign.campaign_description}</p>
                  </div>

                  {campaign.required_niches && campaign.required_niches.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Required Niches</h3>
                      <div className="flex flex-wrap gap-2">
                        {campaign.required_niches.map((niche: string) => (
                          <Badge key={niche} variant="secondary">{niche}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {campaign.required_platforms && campaign.required_platforms.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Required Platforms</h3>
                      <div className="flex flex-wrap gap-2">
                        {campaign.required_platforms.map((platform: string) => (
                          <Badge key={platform} variant="secondary">{platform}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {campaign.deliverables && campaign.deliverables.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Deliverables</h3>
                      <div className="flex flex-wrap gap-2">
                        {campaign.deliverables.map((deliverable: string) => (
                          <Badge key={deliverable} variant="outline">{deliverable}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(campaign.budget_min || campaign.budget_max) && (
                    <div>
                      <h3 className="font-semibold mb-2">Budget</h3>
                      <p className="text-sm text-muted-foreground">
                        {campaign.budget_min && campaign.budget_max
                          ? `${campaign.currency?.toUpperCase() || 'USD'} ${campaign.budget_min.toLocaleString()} - ${campaign.budget_max.toLocaleString()}`
                          : campaign.budget_min
                          ? `From ${campaign.currency?.toUpperCase() || 'USD'} ${campaign.budget_min.toLocaleString()}`
                          : `Up to ${campaign.currency?.toUpperCase() || 'USD'} ${campaign.budget_max.toLocaleString()}`
                        }
                      </p>
                    </div>
                  )}

                  {(campaign.timeline_start || campaign.timeline_end) && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Timeline
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {campaign.timeline_start && new Date(campaign.timeline_start).toLocaleDateString()} 
                        {campaign.timeline_start && campaign.timeline_end && ' - '}
                        {campaign.timeline_end && new Date(campaign.timeline_end).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="mt-6">
              <ApplicationsList 
                applications={applications || []} 
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.action} Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'Close' 
                ? 'This will close the campaign and it cannot be reopened. Are you sure?'
                : `Are you sure you want to ${confirmDialog.action.toLowerCase()} this campaign?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggleStatus.isPending}>Cancel</AlertDialogCancel>
            <Button 
              type="button"
              onClick={handleStatusChange}
              disabled={toggleStatus.isPending}
              variant={confirmDialog.action === 'Close' ? 'destructive' : 'default'}
            >
              {toggleStatus.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmDialog.action
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
