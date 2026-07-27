import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/applications";
import { CollaborationContractModal } from "@/components/contracts/CollaborationContractModal";
import { useCollaborationContract } from "@/hooks/useCollaborationContract";
import { ApplicationApprovalModal } from "@/components/host/ApplicationApprovalModal";
import { ApplicationDetailModal } from "@/components/applications/ApplicationDetailModal";

interface HostApplicationsProps {
  hostId: string;
}

const HostApplications = ({ hostId }: HostApplicationsProps) => {
  const [sentInvites, setSentInvites] = useState<any[]>([]);  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [pendingAgreement, setPendingAgreement] = useState<any>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const { toast } = useToast();
  const { signContract, isSigningContract, buildContractData } = useCollaborationContract();

  useEffect(() => {
    fetchApplications();

    const channel = supabase
      .channel('host-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hostId]);
  const fetchApplications = async () => {
    try {
  
      const selectQuery = `
        *,
        properties(
          id,
          title,
          location,
          property_type,
          collaboration_type
        ),
        influencers(
          id,
          total_followers,
          engagement_rate,
          content_niches,
          instagram_url,
          tiktok_url,
          youtube_url,
          twitter_url,
          profiles(
            first_name,
            last_name,
            profile_photo_url,
            bio,
            location,
            username
          )
        ),
        collaboration_agreements(
          id,
          status,
          application_id,
          host_id,
          influencer_id,
          host_signed_at,
          influencer_signed_at,
          host_signature_data,
          influencer_signature_data,
          host_legal_name,
          influencer_legal_name,
          deadline,
          content_requirements,
          contract_version,
          affiliate_commission_rate
        )
      `;
  
  
      const { data, error } = await supabase
        .from("applications")
        .select(selectQuery)
        .eq("properties.host_id", hostId);
  
  
      if (error) throw error;
  
  
      const formattedApplications = (data || []).map((app:any)=>({
  
        ...app,
  
        agreement: app.collaboration_agreements?.[0] || null,
  
        agreement_status:
          app.collaboration_agreements?.[0]?.status || null
  
      }));
  
  
      setApplications(
        formattedApplications.filter(
          (app:any)=>app.initiated_by === "influencer"
        )
      );
  
  
      setSentInvites(
        formattedApplications.filter(
          (app:any)=>app.initiated_by === "host"
        )
      );
  
  
    } catch(error){
  
      console.error(
        "Error fetching applications:",
        error
      );
  
      toast({
        title:"Error",
        description:"Failed to load applications",
        variant:"destructive"
      });
  
    } finally {
  
      setLoading(false);
  
    }
  };

  const handleApproveClick = (application: any) => {
    setSelectedApplication(null);
    setPendingApproval(application);
    setApprovalModalOpen(true);
  };

  const handleRejectClick = (application: any) => {
    updateApplicationStatus(application.id, 'rejected');
  };

  const handleApprovalConfirm = async (commissionRate: number) => {
    if (!pendingApproval) return;
    setIsApproving(true);

    try {
      // First update the application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', pendingApproval.id);

      if (updateError) throw updateError;

      // Create collaboration agreement with commission rate
      const { data: agreementData, error: agreementError } = await supabase
        .from('collaboration_agreements')
        .insert({
          application_id: pendingApproval.id,
          host_id: hostId,
          influencer_id: pendingApproval.influencer_id,
          status: 'pending_host',
          deadline: pendingApproval.content_deadline,
          content_requirements: pendingApproval.content_deliverables || [],
          contract_version: 'v1.0',
          affiliate_commission_rate: commissionRate,
        })
        .select(`
          *,
          application:applications(
            id, proposed_dates_start, proposed_dates_end, content_deliverables, content_deadline,
            influencer:influencers(
              id, total_followers, instagram_url,
              profiles:profiles(first_name, last_name)
            ),
            property:properties(
              id, title, location, property_type, collaboration_type
            )
          )
        `)
        .single();

      if (agreementError) {
        console.error('Error creating collaboration agreement:', agreementError);
        toast({
          title: "Application approved",
          description: "Application approved but collaboration agreement creation failed. Please contact support.",
          variant: "destructive",
        });
      } else {
        // Close approval modal and open contract modal
        setApprovalModalOpen(false);
        setPendingApproval(null);
        setPendingAgreement(agreementData);
        setContractModalOpen(true);
        toast({
          title: "Application Approved!",
          description: `Commission rate set to ${(commissionRate * 100).toFixed(0)}%. Please review and sign the contract.`,
        });
      }

      fetchApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    // For approval, use the modal flow instead
    if (status === 'approved') {
      const application = applications.find((app: any) => app.id === applicationId);
      if (application) {
        handleApproveClick(application);
      }
      return;
    }

    try {
      // First update the application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      setSelectedApplication(null);
      toast({
        title: "Application updated",
        description: `Application has been ${status}`,
      });

      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      });
    }
  };

  const handleContractSigned = (data: { signatureData: string; legalName: string }) => {
    if (!pendingAgreement) return;

    signContract(
      {
        agreementId: pendingAgreement.id,
        signatureData: data.signatureData,
        legalName: data.legalName,
        partyType: "host",
      },
      {
        onSuccess: () => {
          setContractModalOpen(false);
          setPendingAgreement(null);
          fetchApplications();
        },
      }
    );
  };

  // Reusable influencer card row
  const ApplicationCard = ({ application, isSentInvite = false }: { application: any; isSentInvite?: boolean }) => {
    console.log(application)
    return(
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => !isSentInvite && setSelectedApplication(application)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={application.influencers?.profiles?.profile_photo_url} />
              <AvatarFallback>
                {application.influencers?.profiles?.first_name?.[0]}
                {application.influencers?.profiles?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">
                {application.influencers?.profiles?.first_name} {application.influencers?.profiles?.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isSentInvite ? 'Invited for: ' : 'Applied for: '}{application.properties?.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{application.properties?.location}</p>
              {application.influencers?.total_followers && (
                <p className="text-sm text-muted-foreground mt-1">
                  {application.influencers.total_followers >= 1000
                    ? `${(application.influencers.total_followers / 1000).toFixed(0)}K`
                    : application.influencers.total_followers} followers
                </p>
              )}
            </div>
          </div>
          <Badge variant={
            application.status === 'approved' ? 'default' :
            application.status === 'rejected' ? 'destructive' : 'secondary'
          }>
            {application.status}
          </Badge>
          {application.agreement?.host_signed_at === null &&
 application.agreement?.influencer_signed_at !== null && (
  <Button
    onClick={(e)=>{
      e.stopPropagation();
      setPendingAgreement(application.agreement);
      setContractModalOpen(true);
    }}
  >
    Sign Contract
  </Button>
)}
        </div>
      </CardContent>
    </Card>
    )
}
  if (loading) {
    return <div>Loading applications...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Applications</h2>
       
       <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Received Applications
        </h3>
        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No applications received yet</p>
            </CardContent>
          </Card>
        ) : (
          applications.map((application: any) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        )}
      </div>

     
      {sentInvites.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Send className="w-5 h-5" />
            Invites Sent by You
          </h3>
          {sentInvites.map((invite: any) => (
            <ApplicationCard key={invite.id} application={invite} isSentInvite={true} />
          ))}
        </div>
      )}
     

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onApprove={() => handleApproveClick(selectedApplication)}
        onReject={() => handleRejectClick(selectedApplication)}
        applicationType="host"
      />

      {/* Contract Signing Modal */}
      {pendingAgreement && (
        <CollaborationContractModal
          open={contractModalOpen}
          onOpenChange={setContractModalOpen}
          onContractSigned={handleContractSigned}
          contractData={buildContractData(pendingAgreement)}
          partyType="host"
          isSubmitting={isSigningContract}
        />
      )}

      {/* Approval Modal with Commission Selection */}
      {pendingApproval && (
        <ApplicationApprovalModal
          open={approvalModalOpen}
          onOpenChange={(open) => {
            setApprovalModalOpen(open);
            if (!open) setPendingApproval(null);
          }}
          onApprove={handleApprovalConfirm}
          creatorName={`${pendingApproval.influencers?.profiles?.first_name || ""} ${pendingApproval.influencers?.profiles?.last_name || ""}`.trim() || "Creator"}
          propertyTitle={pendingApproval.properties?.title || "Property"}
          isLoading={isApproving}
        />
      )}
    </div>
  );
};

export default HostApplications;
