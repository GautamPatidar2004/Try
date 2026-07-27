import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Handshake,
  MessageSquare,
  FileText,
  ExternalLink,
  CheckCircle,
  Star,
  Clock,
  FileSignature,
  Eye,
} from "lucide-react";
import BrandReviewModal from "@/components/collaboration/BrandReviewModal";
import { CollaborationContractModal } from "@/components/contracts/CollaborationContractModal";
import { useCollaborationContract } from "@/hooks/useCollaborationContract";
import CompleteCollaborationModal from "@/components/collaboration/CompleteCollaborationModal";
import { ContractViewModal } from "@/components/contracts/ContractViewModal";

interface BrandCollaborationsManagerProps {
  profile: any;
  onTabChange?: (tab: string) => void;
}

const BrandCollaborationsManager = ({
  profile,
  onTabChange,
}: BrandCollaborationsManagerProps) => {
  const queryClient = useQueryClient();
  const [selectedCollaboration, setSelectedCollaboration] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [contractModal, setContractModal] = useState<{
    isOpen: boolean;
    collaboration: any;
  }>({ isOpen: false, collaboration: null });
  const [completeModal, setCompleteModal] = useState<{
    isOpen: boolean;
    collaboration: any;
    isReviewOnly: boolean;
  }>({ isOpen: false, collaboration: null, isReviewOnly: false });
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    collaboration: any;
  }>({
    isOpen: false,
    collaboration: null
  });
  const { signContract, isSigningContract, buildBrandContractData } =
    useCollaborationContract();

  const { data: collaborations, isLoading } = useQuery({
    queryKey: ["brand-collaborations", profile?.id],
    queryFn: async () => {
      // Cast every result to `any[]` so TS never tries to infer
      // column names from Supabase's generated types (which fail when
      // the table isn't in the codegen schema / has ambiguous FKs).

      // Step 1: agreements
      const { data: agreementsRaw, error } = await supabase
        .from("brand_collaboration_agreements" as any)
        .select("*")
        .eq("brand_id", profile?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const agreements = (agreementsRaw ?? []) as any[];
      if (!agreements.length) return [];

      // Step 2: campaigns
      const campaignIds = [
        ...new Set(agreements.map((a: any) => a.campaign_id).filter(Boolean)),
      ];
      const { data: campaignsRaw } = campaignIds.length
        ? await supabase
            .from("brand_campaigns")
            .select(
              "id, campaign_title, brand_name, deliverables, content_requirements, creator_payout, currency, timeline_start, timeline_end"
            )
            .in("id", campaignIds)
        : { data: [] };
      const campaigns = (campaignsRaw ?? []) as any[];

      // Step 3: applications
      const applicationIds = [
        ...new Set(agreements.map((a: any) => a.application_id).filter(Boolean)),
      ];
      const { data: applicationsRaw } = applicationIds.length
        ? await supabase
            .from("brand_campaign_applications")
            .select("id, influencer_id, campaign_id")
            .in("id", applicationIds)
        : { data: [] };
      const applications = (applicationsRaw ?? []) as any[];

      // Step 4: influencers
      const influencerIds = [
        ...new Set(
          applications.map((a: any) => a.influencer_id).filter(Boolean)
        ),
      ];
      const { data: influencersRaw } = influencerIds.length
        ? await supabase
            .from("influencers")
            .select("id, instagram_url, total_followers, engagement_rate")
            .in("id", influencerIds)
        : { data: [] };
      const influencers = (influencersRaw ?? []) as any[];

      // Step 5: display profiles
      const { data: profilesRaw } = influencerIds.length
        ? await supabase
            .from("profiles")
            .select("id, first_name, last_name, profile_photo_url, location")
            .in("id", influencerIds)
        : { data: [] };
      const profiles = (profilesRaw ?? []) as any[];

      // Step 6: existing reviews by this brand
      const { data: reviewsRaw } = await supabase
        .from("reviews_and_ratings")
        .select("brand_agreement_id")
        .eq("reviewer_id", profile?.id)
        .eq("reviewer_type", "brand");
      const reviewedIds = new Set(
        ((reviewsRaw ?? []) as any[]).map((r: any) => r.brand_agreement_id)
      );

      // Step 7: stitch in JS — no Supabase type inference involved
      return agreements.map((agreement: any) => {
        const app        = applications.find((a: any) => a.id === agreement.application_id);
        const campaign   = campaigns.find((c: any) => c.id === agreement.campaign_id);
        const influencer = influencers.find((i: any) => i.id === app?.influencer_id);
        const profile_   = profiles.find((p: any) => p.id === app?.influencer_id);

        return {
          ...agreement,
          campaign,
          application: app ? { ...app, influencer } : null,
          influencer,
          profile: profile_,
          hasReviewed: reviewedIds.has(agreement.id),
        };
      });
    },
    enabled: !!profile?.id,
  });

  const isContractSigned = (collab: any) =>
    collab.status === "active" || collab.status === "completed";

  const openContractModal  = (c: any) => setContractModal({ isOpen: true, collaboration: c });
  const closeContractModal = ()       => setContractModal({ isOpen: false, collaboration: null });

  const openCompleteModal  = (c: any, isReviewOnly = false) =>
    setCompleteModal({ isOpen: true, collaboration: c, isReviewOnly });
  const closeCompleteModal = () =>
    setCompleteModal({ isOpen: false, collaboration: null, isReviewOnly: false });

  const handleContractSigned = (data: { signatureData: string; legalName: string }) => {
    if (!contractModal.collaboration) return;
    signContract(
      {
        agreementId:   contractModal.collaboration.id,
        signatureData: data.signatureData,
        legalName:     data.legalName,
        partyType:     "brand",
      },
      {
        onSuccess: () => {
          closeContractModal();
          queryClient.invalidateQueries({
            queryKey: ["brand-collaborations", profile?.id],
          });
        },
      }
    );
  };

  const handleCompleteClick = (collab: any) => {
    
    setSelectedCollaboration(collab);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    queryClient.invalidateQueries({ queryKey: ["brand-collaborations"] });
    setIsReviewModalOpen(false);
    setSelectedCollaboration(null);
  };

  const openViewModal = (collaboration: any) => {
    setViewModal({
      isOpen: true,
      collaboration
    });
  };

  const closeViewModal = () => {
    setViewModal({
      isOpen: false,
      collaboration: null
    });
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

  const creatorName = selectedCollaboration?.profile
    ? `${selectedCollaboration.profile.first_name || ""} ${
        selectedCollaboration.profile.last_name || ""
      }`.trim() || "Creator"
    : "Creator";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Active Collaborations</h2>
        <p className="text-muted-foreground">Manage your ongoing creator partnerships</p>
      </div>

      {!collaborations || collaborations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Handshake className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No active collaborations</h3>
            <p className="text-muted-foreground text-center mb-4">
              Accept creator applications to start collaborating
            </p>
            <Button onClick={() => onTabChange?.("applications")}>
              View Applications
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {collaborations.map((collab: any) => {
            const signed = isContractSigned(collab);
           
            return (
              <Card key={collab.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">

                    {/* Left: creator info */}
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={collab.profile?.profile_photo_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {collab.profile?.first_name?.[0]}
                          {collab.profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {collab.profile?.first_name} {collab.profile?.last_name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={
                              collab.status === "active"
                                ? "bg-green-100 text-green-800"
                                : collab.status === "pending_brand" ||
                                  collab.status === "pending_creator"
                                ? "bg-yellow-100 text-yellow-800"
                                : collab.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {collab.status === "pending_brand"
                              ? "Awaiting Your Signature"
                              : collab.status === "pending_creator"
                              ? "Awaiting Creator Signature"
                              : collab.status === "active"
                              ? "Active"
                              : collab.status === "completed"
                              ? collab.hasReviewed
                                ? "Reviewed"
                                : "Completed"
                              : collab.status}
                          </Badge>
                        </div>

                        <p className="text-sm font-medium text-primary">
                          {collab.campaign?.campaign_title}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {collab.influencer?.total_followers?.toLocaleString() || 0} followers
                          </span>
                          <span>{collab.profile?.location}</span>
                        </div>

                        {collab.campaign?.deliverables?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {collab.campaign.deliverables.map((d: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {d}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {(collab.campaign?.timeline_start || collab.campaign?.timeline_end) && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Timeline:{" "}
                            {collab.campaign.timeline_start &&
                              new Date(collab.campaign.timeline_start).toLocaleDateString()}
                            {collab.campaign.timeline_end &&
                              ` – ${new Date(collab.campaign.timeline_end).toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex flex-col gap-2 min-w-[160px]">

                      {/* ── NOT YET SIGNED ── */}
                      {!signed && (
                        <>
                          {collab.status === "pending_brand" && (
                            <Button size="sm" onClick={() => openContractModal(collab)}>
                              <FileSignature className="w-4 h-4 mr-1" />
                              Sign Contract
                            </Button>
                          )}
                          {collab.status === "pending_creator" && (
                            <>
                            <div className="flex items-center gap-1 text-yellow-600 text-sm px-1">
                              <Clock className="w-4 h-4 shrink-0" />
                              <span>Awaiting creator signature</span>
                            </div>
                            <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewModal(collab)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Contract
                          </Button>
                            </>
                          )}
                          
                        </>
                      )}


                      {/* ── SIGNED — all actions live ── */}
                      {signed && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewModal(collab)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Contract
                          </Button>
                          {collab.status === "active" && !collab.hasReviewed && (
                          
                            <Button
                              size="sm"
                              onClick={() => handleCompleteClick(collab)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete &amp; Review
                            </Button>
                          )}
                          {collab.hasReviewed && (
                            <div className="flex items-center gap-1 text-green-600 text-sm">
                              <Star className="w-4 h-4" />
                              <span>Reviewed</span>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTabChange?.("messages")}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />Message
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTabChange?.("content")}
                          >
                            <FileText className="w-4 h-4 mr-1" />View Content
                          </Button>
                          {collab.influencer?.instagram_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={collab.influencer.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />Profile
                              </a>
                            </Button>
                          )}
                        </>
                      )}

                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Contract signing modal */}
      {contractModal.isOpen && contractModal.collaboration && (
        <CollaborationContractModal
          open={contractModal.isOpen}
          onOpenChange={closeContractModal}
          onContractSigned={handleContractSigned}
          contractData={buildBrandContractData(contractModal.collaboration)}
          partyType="brand"
          isSubmitting={isSigningContract}
        />
      )}

{/* view contract  */}
{viewModal.isOpen && viewModal.collaboration && (
       <ContractViewModal
       open={viewModal.isOpen}
       onOpenChange={closeViewModal}
       contractData={buildBrandContractData(viewModal.collaboration)}
       status={viewModal.collaboration.status}
       hostSignature={viewModal.collaboration.brand_signature_data}        // ← was host_signature_data
       influencerSignature={viewModal.collaboration.creator_signature_data} // ← was influencer_signature_data
       hostLegalName={viewModal.collaboration.brand_legal_name}            // ← was host_legal_name
       influencerLegalName={viewModal.collaboration.creator_legal_name}    // ← was influencer_legal_name
       hostSignedAt={viewModal.collaboration.brand_signed_at}              // ← was host_signed_at
       influencerSignedAt={viewModal.collaboration.creator_signed_at}      // ← was influencer_signed_at
       partyType="brand"
     />
      )}

      {/* Review modal */}
      {selectedCollaboration && (
        <BrandReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedCollaboration(null);
          }}
          agreementId={selectedCollaboration.id}             // ✅ agreement id → reviews_and_ratings
          applicationId={selectedCollaboration.application_id}
          reviewerId={profile?.id}
          revieweeId={selectedCollaboration.influencer_id}
          revieweeName={creatorName}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Complete collaboration modal */}
      {completeModal.isOpen && completeModal.collaboration && (
        <CompleteCollaborationModal
          isOpen={completeModal.isOpen}
          onClose={closeCompleteModal}
          collaboration={completeModal.collaboration}
          userId={profile?.id}
          userType="host"
          onComplete={() =>
            queryClient.invalidateQueries({ queryKey: ["brand-collaborations"] })
          }
          isReviewOnly={completeModal.isReviewOnly}
        />
      )}
    </div>
  );
};

export default BrandCollaborationsManager;