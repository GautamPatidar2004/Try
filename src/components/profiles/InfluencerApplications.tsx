import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Eye, FileSignature ,Send,CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CollaborationContractModal } from "@/components/contracts/CollaborationContractModal";
import { useCollaborationContract } from "@/hooks/useCollaborationContract";

interface InfluencerApplicationsProps {
  influencerId: string;
}

interface PendingContract {
  agreement: any;
 contractData:any;
  contractType: "stay" | "brand";
}

const InfluencerApplications = ({ influencerId }: InfluencerApplicationsProps) => {
  const [applications, setApplications] = useState([]);
  const [pendingContracts, setPendingContracts] = useState<PendingContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<PendingContract | null>(null);
  const [receivedInvites, setReceivedInvites] = useState<any[]>([]);
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { signContract, isSigningContract, buildContractData,buildBrandContractData } = useCollaborationContract();

  useEffect(() => {
    fetchApplications();
    fetchPendingContracts();

    // Set up real-time subscription for application updates
    const appChannel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `influencer_id=eq.${influencerId}`
        },
        () => {
          fetchApplications();
        }
          )     
      .subscribe();

    // Set up real-time subscription for agreement updates
    const agreementChannel = supabase
      .channel('agreements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_agreements',
          filter: `influencer_id=eq.${influencerId}`
        },
        () => {
          fetchPendingContracts();
        }
      )
      .subscribe();
  // Real-time: brand agreements
  const brandAgreementChannel = supabase
  .channel('brand-agreements-changes')
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'brand_collaboration_agreements',
    filter: `influencer_id=eq.${influencerId}`
  }, () => fetchPendingContracts())
  .subscribe();
  

    return () => {
      supabase.removeChannel(appChannel);
      supabase.removeChannel(agreementChannel);
      supabase.removeChannel(brandAgreementChannel);
    };
  }, [influencerId]);

  const fetchPendingContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_agreements')
        .select(`
          *,
          application:applications(
            id, proposed_dates_start, proposed_dates_end, content_deliverables, content_deadline,
            influencer:influencers(
              id, total_followers, instagram_url,
              profiles:profiles(first_name, last_name)
            ),
            property:properties(
              id, title, location, property_type, collaboration_type,
              host:hosts(
                id,
                profiles:profiles(first_name, last_name)
              )
            )
          )
        `)
        .eq('influencer_id', influencerId)
        .eq('status', 'pending_influencer');

      if (error) throw error;

      const contracts: PendingContract[] = (data || []).map(agreement => ({
        agreement,
        contractData: buildContractData(agreement),
        contractType: "stay",
      }));
      // ── Brand campaign pending contracts ─────────────────────────────────────
      const { data: brandData, error: brandError } = await (supabase
        .from('brand_collaboration_agreements' as any)
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
        .eq('influencer_id', influencerId)
        .eq('status', 'pending_creator'));

      if (brandError) throw brandError;

      const brandContracts: PendingContract[] = (brandData || []).map((agreement: any) => ({
        agreement,
        contractData: buildBrandContractData(agreement),
        contractType: "brand",
      }))
      setPendingContracts([...contracts, ...brandContracts]);
    } catch (error) {
      console.error('Error fetching pending contracts:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          properties(
            title, location, collaboration_type,
            hosts(profiles(first_name, last_name))
          )
        `)
        .eq('influencer_id', influencerId)
        .eq('initiated_by', 'influencer')   
        .order('created_at', { ascending: false });

      if (error) throw error;

      
      const { data: invitedBrandApps } = await supabase
        .from('brand_campaign_applications')
        .select(`
          *,
          campaign:brand_campaigns(id, campaign_title, brand_name, creator_payout, currency, status)
        `)
        .eq('influencer_id', influencerId)
        .eq('initiated_by', 'brand');       // ← received invites from brand

      
      const { data: invitedPropertyApps } = await supabase
        .from('applications')
        .select(`
          *,
          properties(title, location, collaboration_type, hosts(profiles(first_name, last_name)))
        `)
        .eq('influencer_id', influencerId)
        .eq('initiated_by', 'host');        

     
      const { data: brandApplications } = await supabase
        .from("brand_campaign_applications")
        .select(`
          *,
          campaign:brand_campaigns(id, campaign_title, brand_name, creator_payout, currency, status)
        `)
        .eq("influencer_id", influencerId)
        .eq("initiated_by", "influencer"); 

      // Normalize brand applications
      const normalizedBrandApps = (brandApplications || []).map((app: any) => ({
        ...app,
        applicationType: "brand",
        title: app.campaign?.campaign_title || "Brand Campaign",
        location: app.campaign?.brand_name || "",
        hostName: app.campaign?.brand_name || "",
        collaboration_type: "brand_campaign",
      }));

      // Merge applications 
      const mergedApplications = [
        ...(data || []),
        ...normalizedBrandApps,
      ].sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setApplications(mergedApplications);

      // Received invites (host/brand )
      const normalizedPropertyInvites = (invitedPropertyApps || []).map((app: any) => ({
        ...app,
        applicationType: "property_invite",
        title: app.properties?.title || "Property",
        location: app.properties?.location || "",
      }));

      const normalizedBrandInvites = (invitedBrandApps || []).map((app: any) => ({
        ...app,
        applicationType: "brand_invite",
        title: app.campaign?.campaign_title || "Brand Campaign",
        location: app.campaign?.brand_name || "",
      }));

      setReceivedInvites([...normalizedPropertyInvites, ...normalizedBrandInvites]
        .sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );

    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

 
  const handleAcceptInvite = async (invite: any) => {
    setProcessingInviteId(invite.id);
    try {
      const isPropertyInvite = invite.applicationType === "property_invite";

      if (isPropertyInvite) {
      
        const { error: updateError } = await supabase
          .from('applications')
          .update({ status: 'approved' })
          .eq('id', invite.id);

        if (updateError) throw updateError;

        
        const { data: propertyData } = await supabase
          .from('properties')
          .select('host_id')
          .eq('id', invite.property_id)
          .single();

        if (!propertyData?.host_id) throw new Error('Host not found');

        
        const { data: agreementData, error: agreementError } = await supabase
          .from('collaboration_agreements')
          .insert({
            application_id: invite.id,
            host_id: propertyData.host_id,
            influencer_id: influencerId,
            status: 'pending_influencer', 
            content_requirements: invite.content_deliverables || [],
            contract_version: 'v1.0',
            affiliate_commission_rate: 0,
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
                id, title, location, property_type, collaboration_type,
                host:hosts(id, profiles:profiles(first_name, last_name))
              )
            )
          `)
          .single();

        if (agreementError) throw agreementError;

    
        setSelectedContract({
          agreement: agreementData,
          contractData: buildContractData(agreementData),
          contractType: "stay",
        });
        setContractModalOpen(true);

        toast({
          title: "Invite Accepted!",
          description: "Please review and sign the collaboration contract.",
        });

      } else {
       
        const { error: updateError } = await supabase
          .from('brand_campaign_applications')
          .update({ status: 'approved' })
          .eq('id', invite.id);

        if (updateError) throw updateError;

     
        const { data: campaignData } = await supabase
          .from('brand_campaigns')
          .select('created_by')
          .eq('id', invite.campaign_id)
          .single();

        if (!campaignData?.created_by) throw new Error('Brand not found');

       
        const { data: agreementData, error: agreementError } = await (supabase
          .from('brand_collaboration_agreements' as any)
          .insert({
            application_id: invite.id,
            campaign_id: invite.campaign_id,
            brand_id: campaignData.created_by,
            influencer_id: influencerId,
            status: 'pending_creator',
            contract_version: 'v1.0',
          })
          .select(`
            *,
            campaign:brand_campaigns(
              id, campaign_title, brand_name, timeline_end, deliverables,
              content_requirements, creator_payout, currency
            ),
            application:brand_campaign_applications(
              id, influencer_id,
              influencer:influencers(
                id, total_followers, instagram_url,
                profiles:profiles(first_name, last_name)
              )
            )
          `)
          .single());

        if (agreementError) throw agreementError;

        setSelectedContract({
          agreement: agreementData,
          contractData: buildBrandContractData(agreementData),
          contractType: "brand",
        });
        setContractModalOpen(true);

        toast({
          title: "Invite Accepted!",
          description: "Please review and sign the brand collaboration contract.",
        });
      }

      fetchApplications();
      fetchPendingContracts();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err?.message || "Failed to accept invite.", variant: "destructive" });
    } finally {
      setProcessingInviteId(null);
    }
  };


  const handleRejectInvite = async (invite: any) => {
    setProcessingInviteId(invite.id);
    try {
      const isPropertyInvite = invite.applicationType === "property_invite";
      const table = isPropertyInvite ? 'applications' : 'brand_campaign_applications';

      const { error } = await supabase
        .from(table as any)
        .update({ status: 'rejected' })
        .eq('id', invite.id);

      if (error) throw error;

      toast({ title: "Invite Declined", description: "You have declined this collaboration invite." });
      fetchApplications();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: "Failed to decline invite.", variant: "destructive" });
    } finally {
      setProcessingInviteId(null);
    }
  };

  const handleOpenContract = (contract: PendingContract) => {
    setSelectedContract(contract);
    setContractModalOpen(true);
  };

  const handleContractSigned = (data: { signatureData: string; legalName: string }) => {
    if (!selectedContract) return;

    signContract(
      {
        agreementId: selectedContract.agreement.id,
        signatureData: data.signatureData,
        legalName: data.legalName,
         // ← brand agreements use "creator", stay agreements use "influencer"
        partyType:selectedContract.contractType === "brand" ? "creator" : "influencer",
      },
      {
        onSuccess: () => {
          setContractModalOpen(false);
          setSelectedContract(null);
          fetchPendingContracts();
        },
      }
    );
  };

  if (loading) {
    return <div>Loading applications...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Applications</h2>

      {/* Pending Contracts Section */}
      {pendingContracts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Contracts Awaiting Your Signature
          </h3>
          {pendingContracts.map((contract) => (
            <Card key={contract.agreement.id} className="border-primary/50 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">
                      {contract.contractData.propertyTitle}
                    </h4>
                     {/* Badge distinguishes brand vs stay contracts */}
                     <Badge variant="outline" className="text-xs">
                        {contract.contractType === "brand" ? "Brand Campaign" : "Stay Collaboration"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                    {contract.contractType === "brand"
                        ? `Brand: ${contract.contractData.hostName}`
                        : `Host: ${contract.contractData.hostName} • ${contract.contractData.propertyLocation}`
                    }
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                    {contract.contractType === "brand"
                        ? "The brand has signed — your countersignature is required to activate."
                        : 
                     " The host has signed - your signature is required to finalize."
                    }
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleOpenContract(contract)}
                    className="gap-2"
                  >
                    <FileSignature className="w-4 h-4" />
                    Sign Contract
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
           {/* ── RECEIVED INVITES SECTION ── */}
      {receivedInvites.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Send className="w-5 h-5" />
            Collaboration Invites Received
          </h3>
          {receivedInvites.map((invite: any) => {
            const isProcessing = processingInviteId === invite.id;
            const isPending = invite.status === 'pending';
            console.log("inviteeeee",invite)
            return (
              <Card key={invite.id} className="border-blue-200 bg-blue-50/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{invite.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {invite.applicationType === "brand_invite" ? "Brand Invite" : "Property Invite"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{invite.location}</p>
                      {(invite.proposal_message || invite.cover_letter) && (
                        <div className="bg-white border rounded p-3 mb-3">
                          <p className="text-sm font-medium mb-1">
                            Message from {invite.applicationType === "brand_invite" ? "brand" : "host"}:
                          </p>
                          <p className="text-sm">{invite.proposal_message || invite.cover_letter}</p>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Received on {new Date(invite.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {isPending ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleRejectInvite(invite)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvite(invite)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Badge variant={
                          invite.status === 'approved' ? 'default' :
                          invite.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {invite.status === 'approved' ? 'Accepted' :
                           invite.status === 'rejected' ? 'Declined' : invite.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }
          )}
        </div>
      )}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No applications yet</p>
              <p className="text-sm">Start browsing properties and apply for collaborations</p>
            </div>
            <Button className="mt-4">
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application: any) => (
            <Card key={application.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                    {application.applicationType === "brand"
    ? application.campaign?.campaign_title
    : application.properties?.title}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                    {application.applicationType === "brand"
    ? application.campaign?.brand_name
    : application.properties?.location}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                    {application.applicationType === "brand"
    ? `Brand: ${application.campaign?.brand_name}`
    : `Host: ${application.properties?.hosts?.profiles?.first_name} ${application.properties?.hosts?.profiles?.last_name}`}

                    </p>
                    
                    {application.proposal_message && (
                      <div className="bg-muted p-3 rounded mb-3">
                        <p className="text-sm font-medium mb-1">Your message:</p>
                        <p className="text-sm">{application.proposal_message}</p>
                      </div>
                    )}
                    
                    {application.proposed_dates_start && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Proposed dates: {new Date(application.proposed_dates_start).toLocaleDateString()} - {new Date(application.proposed_dates_end).toLocaleDateString()}
                      </p>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Applied on {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Badge 
                      variant={
                        application.status === 'approved' ? 'default' :
                        application.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {application.status}
                    </Badge>
                    
                    <div className="text-sm text-muted-foreground">
                    {application.applicationType === "brand"
    ? "Brand Campaign"
    : application.properties?.collaboration_type === "free_stay"
    ? "Free Stay"
    : application.properties?.collaboration_type === "discount"
    ? "Discounted Stay"
    : "Paid Collaboration"}
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contract Signing Modal */}
      {selectedContract && (
        <CollaborationContractModal
          open={contractModalOpen}
          onOpenChange={setContractModalOpen}
          onContractSigned={handleContractSigned}
          contractData={selectedContract.contractData}
          partyType= {selectedContract.contractType === "brand" ? "creator" :"influencer"}
          isSubmitting={isSigningContract}
        />
      )}
    </div>
  );
};

export default InfluencerApplications;
