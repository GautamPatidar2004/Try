import { useState } from "react";
import { useQuery,useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BrandApplicationDetailModal } from "@/components/brands/BrandApplicationDetailModal";
import { CollaborationContractModal } from "@/components/contracts/CollaborationContractModal";
import { useCollaborationContract } from "@/hooks/useCollaborationContract";
import CompleteCollaborationModal from "@/components/collaboration/CompleteCollaborationModal";

interface BrandApplicationsManagerProps {
  profile: any;
}

const BrandApplicationsManager = ({ profile }: BrandApplicationsManagerProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [pendingAgreement, setPendingAgreement] = useState<any>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const { signContract, isSigningContract, buildContractData,buildBrandContractData } = useCollaborationContract();
  const { toast } = useToast();

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['brand-applications', profile?.id],
    queryFn: async () => {
      // First get all campaigns for this brand
      const { data: campaigns } = await supabase
        .from('brand_campaigns')
        .select('id, campaign_title')
        .eq('created_by', profile?.id);

      if (!campaigns || campaigns.length === 0) return [];

      const campaignIds = campaigns.map(c => c.id);

      // Then get all applications for these campaigns
      const { data: apps, error } = await supabase
        .from('brand_campaign_applications')
        .select(`
          *,
          influencer:influencers(
            id,
            instagram_url,
            total_followers,
            engagement_rate
          )
        `)
        .in('campaign_id', campaignIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each influencer
      const influencerIds = apps?.map(a => a.influencer_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_photo_url, location')
        .in('id', influencerIds);

      // Map campaign titles and profiles to applications
      return apps?.map(app => ({
        ...app,
        campaign_title: campaigns.find(c => c.id === app.campaign_id)?.campaign_title,
        profile: profiles?.find(p => p.id === app.influencer_id)
      })) || [];
    },
    enabled: !!profile?.id,
  });
// ─── Accept: update status + create brand_collaboration_agreement + open contract ───
  const handleAccept = async (application: any) => {
    setIsAccepting(true);
    try {
      // 1. Mark application as accepted
      const { error: updateError } = await supabase
        .from('brand_campaign_applications')
        .update({
          status: 'accepted',
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id,
        })
        .eq('id', application.id);
      if (updateError) throw updateError;

      // 1b. Open a message thread with the creator (idempotent per application)
      try {
        const { data: existingMsg } = await supabase
          .from('messages')
          .select('id')
          .eq('application_id', application.id)
          .limit(1)
          .maybeSingle();

        if (!existingMsg) {
          const campaignTitle = application.campaign_title || 'your campaign';
          await supabase.from('messages').insert({
            sender_id: profile?.id,
            receiver_id: application.influencer_id,
            application_id: application.id,
            content: `Great news — your application for "${campaignTitle}" has been accepted! Let's coordinate next steps here.`,
          });
        }
      } catch (msgErr) {
        console.error('Failed to create message thread:', msgErr);
      }

      // 2. Create the brand collaboration agreement (pending brand signature)
      const { data: agreementData, error: agreementError } = await supabase
        .from('brand_collaboration_agreements' as any)
        .insert({
          application_id: application.id,
          brand_id: profile?.id,
          influencer_id: application.influencer_id,
          campaign_id: application.campaign_id,
          status: 'pending_brand',         // brand signs first, then creator
          contract_version: 'v1.0',
        })
        .select(`
          *,
           campaign:brand_campaigns(
            id,
            campaign_title,
            brand_name,
            timeline_end,
            deliverables,
            content_requirements,
            creator_payout,
            currency
          ),
          application:brand_campaign_applications(
            id,
  
            influencer_id,
           
            influencer:influencers(
              id,
                 total_followers,
                instagram_url,
                profiles:profiles(first_name, last_name)
              )
            )
          `)
          .single();
        if (agreementError) {
          console.error("Agreement creation error:", agreementError);
        toast({
          title: "Application accepted",
          description: "Accepted but contract creation failed. Please contact support.",
          variant: "destructive",
        });
        refetch();
        return;
      }

      setSelectedApplication(null);
      setPendingAgreement(agreementData);
      setContractModalOpen(true);
      toast({
        title: "Application Accepted!",
        description: "Please review and sign the brand contract.",
      });
      refetch();
    } catch (error) {
      console.error("Error accepting application:", error);
      toast({
        title: "Error",
        description: "Failed to accept application",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };
    

 // ── Reject ─────────────────────────────────────────────────────────────────
 const handleReject = async (applicationId: string) => {
  try {
    const { error } = await supabase
      .from("brand_campaign_applications")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: profile?.id,
      })
      .eq("id", applicationId);

    if (error) throw error;

    toast({
      title: "Application rejected",
      description: "The creator has been notified.",
    });
    setSelectedApplication(null);
    refetch();
  } catch (error) {
    console.error("Error rejecting application:", error);
    toast({
      title: "Error",
      description: "Failed to reject application",
      variant: "destructive",
    });
  }
};
   // ─── Contract signed by brand → relay to hook ─────────────────────────────────
 	
  // ── Contract signed by brand ───────────────────────────────────────────────
   // ─── Contract signed by brand → relay to hook ─────────────────────────────────
  // ── Contract signed by brand ───────────────────────────────────────────────
  const handleContractSigned = (data: { signatureData: string; legalName: string }) => {
    if (!pendingAgreement) return;

    signContract(
      {
        agreementId:   pendingAgreement.id,
        signatureData: data.signatureData,
        legalName:     data.legalName,
        partyType:     "brand",
      },
      {
        onSuccess: () => {
          setContractModalOpen(false);
          setPendingAgreement(null);
          refetch();
        },
      }
    );
  }
  
  const handleUpdateStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('brand_campaign_applications')
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Application ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`,
      });
      refetch();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const filteredApplications = applications?.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  }) || [];


  const getCount = (status: string) => {
    if (status === 'all') return applications?.length || 0;
    return applications?.filter(a => a.status === status).length || 0;
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Creator Applications</h2>
        <p className="text-muted-foreground">Review and manage applications from creators</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({getCount('all')})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({getCount('pending')})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({getCount('accepted')})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({getCount('rejected')})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications</h3>
                <p className="text-muted-foreground text-center">
                  {activeTab === 'all' 
                    ? "You don't have any applications yet"
                    : `No ${activeTab} applications`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.profile?.profile_photo_url} />
                          <AvatarFallback>
                            {application.profile?.first_name?.[0]}
                            {application.profile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {application.profile?.first_name} {application.profile?.last_name}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Applied for: {application.campaign_title}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{application.influencer?.total_followers?.toLocaleString() || 0} followers</span>
                            <span>{application.profile?.location}</span>
                          </div>
                          {application.cover_letter && (
                            <p className="text-sm mt-2 line-clamp-2">{application.cover_letter}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                      {application.initiated_by === "brand" ? (
  // Brand invite case
  <Badge
    variant={
      application.status === 'accepted'
        ? 'default'
        : application.status === 'rejected'
        ? 'destructive'
        : 'secondary'
    }
  >
    {application.status === 'accepted'
      ? 'Accepted'
      : application.status === 'rejected'
      ? 'Rejected'
      : 'Pending'}
  </Badge>
) : (
  // Influencer applied case
  application.status === 'pending' && (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleReject(application.id)}
      >
        <XCircle className="w-4 h-4 mr-1" />
        Reject
      </Button>

      <Button
        size="sm"
        disabled={isAccepting}
        onClick={() => handleAccept(application)}
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        Accept
      </Button>
    </>
  )
)}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BrandApplicationDetailModal
        application={selectedApplication}
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdateStatus={(id, status) =>
          status === "accepted" ? handleAccept(selectedApplication) : handleReject(id)
        }
      />

      {/* Brand contract signing modal — same component as stay campaigns */}
      {pendingAgreement && (
        <CollaborationContractModal
          open={contractModalOpen}
          onOpenChange={setContractModalOpen}
          onContractSigned={handleContractSigned}
          contractData={buildBrandContractData(pendingAgreement)}
          partyType="brand"
          isSubmitting={isSigningContract}
        />
      )}
    </div>
  );
};

export default BrandApplicationsManager;
