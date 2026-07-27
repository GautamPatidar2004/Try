import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, Clock, MessageSquare, Calendar, FileSignature, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CollaborationContractModal } from "@/components/contracts/CollaborationContractModal";
import { ContractViewModal } from "@/components/contracts/ContractViewModal";
import { useCollaborationContract } from "@/hooks/useCollaborationContract";
import CompleteCollaborationModal from "@/components/collaboration/CompleteCollaborationModal";

interface CollaborationsListProps {
  userId: string;
  userType: 'host' | 'influencer';
}
type CollabSource = 'host_influencer' | 'brand_creator';
const CollaborationsList = ({ userId, userType }: CollaborationsListProps) => {
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractModal, setContractModal] = useState<{
    isOpen: boolean;
    collaboration: any;
  }>({
    isOpen: false,
    collaboration: null
  });
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    collaboration: any;
  }>({
    isOpen: false,
    collaboration: null
  });
  const [completeModal, setCompleteModal] = useState<{
    isOpen: boolean;
    collaboration: any;
    isReviewOnly: boolean;
  }>({
    isOpen: false,
    collaboration: null,
    isReviewOnly: false
  });
  const { toast } = useToast();
  const { signContract, isSigningContract, buildContractData } = useCollaborationContract();

  useEffect(() => {
    fetchCollaborations();
  }, [userId, userType]);

  // ─────────────────────────────────────────────
  // Helpers: normalise brand-creator collab shape
  // ─────────────────────────────────────────────

  /**
   * Maps a brand_collaboration_agreements row (plus enrichment) into the
   * same shape the rest of the component expects from collaboration_agreements.
   *
   * Key additions:
   *   _source          → 'brand_creator'   (used for signing / view logic)
   *   counterpart      → brand profile
   *   host_signature_data / influencer_signature_data → aliased from brand/creator fields
   *   status           → re-mapped so the same needsToSign / isWaiting helpers work
   */
  const normaliseBrandCollab = (
    raw: any,           // brand_collaboration_agreements row (no auto-joins)
    brandProfile: any,  // profiles row for the brand
    brandCampaignApp: any, // brand_campaign_applications row
    influencerRecord: any, // influencers row
    creatorProfile: any,   // profiles row for the creator
    hasReviewed: boolean,
    counterpartHasReviewed: boolean,
  ) => ({
    // Spread only safe scalar fields — do NOT spread raw directly because
    // Supabase may auto-join `applications` via the FK and give us a wrong shape.
    id: raw.id,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    agreed_at: raw.agreed_at,
    campaign_id: raw.campaign_id,
    application_id: raw.application_id,
    brand_id: raw.brand_id,
    influencer_id: raw.influencer_id,
    status: raw.status === 'pending_brand'
      ? 'pending_host'
      : raw.status === 'pending_creator'
      ? 'pending_influencer'
      : raw.status,
    _originalStatus: raw.status,
    _source: 'brand_creator' as CollabSource,

    // Raw signature fields (kept for reference)
    brand_signature_data: raw.brand_signature_data,
    brand_legal_name: raw.brand_legal_name,
    brand_signed_at: raw.brand_signed_at,
    creator_signature_data: raw.creator_signature_data,
    creator_legal_name: raw.creator_legal_name,
    creator_signed_at: raw.creator_signed_at,

    // Aliased so ContractViewModal & signing logic work uniformly
    host_signature_data: raw.brand_signature_data,
    influencer_signature_data: raw.creator_signature_data,
    host_legal_name: raw.brand_legal_name,
    influencer_legal_name: raw.creator_legal_name,
    host_signed_at: raw.brand_signed_at,
    influencer_signed_at: raw.creator_signed_at,

    // Counterpart = brand (for influencer view)
    counterpart: brandProfile || {},
    counterpartId: raw.brand_id,
    hasReviewed,
    counterpartHasReviewed,

    // Campaign & people for display / contract building
    campaign: raw.campaign,
    influencer: influencerRecord,
    profile: creatorProfile,
    brandCampaignApp,

    // Payout
    agreed_rate: raw.campaign?.creator_payout ?? null,
    currency: raw.campaign?.currency ?? 'usd',
    deadline: brandCampaignApp?.deadline ?? null,
  });

  const fetchCollaborations = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_agreements')
        .select(`
          *,
          applications!inner(
            id,
            proposed_dates_start,
            proposed_dates_end,
            content_deliverables,
            content_deadline,
            properties(
              id,
              title,
              location,
              property_type,
              collaboration_type,
              host:hosts(
                id,
                profiles(first_name, last_name)
              )
            ),
            influencer:influencers(
              id,
              total_followers,
              instagram_url,
              profiles(first_name, last_name, profile_photo_url)
            )
          )
        `)
        .eq(userType === 'host' ? 'host_id' : 'influencer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch counterpart profiles and existing reviews
      const enrichedCollaborations = await Promise.all(
        (data || []).map(async (collab) => {
          const counterpartId = userType === 'host' ? collab.influencer_id : collab.host_id;
          
          // Get counterpart profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, profile_photo_url')
            .eq('id', counterpartId)
            .single();

          // Check if review exists from this user
          const { data: existingReview } = await supabase
            .from('reviews_and_ratings')
            .select('id')
            .eq('agreement_id', collab.id)
            .eq('reviewer_id', userId)
            .single();

          // Check if counterpart has reviewed
          const { data: counterpartReview } = await supabase
            .from('reviews_and_ratings')
            .select('id')
            .eq('agreement_id', collab.id)
            .eq('reviewer_id', counterpartId)
            .single();

          return {
            ...collab,
            counterpart: profileData || {},
            counterpartId,
            hasReviewed: !!existingReview,
            counterpartHasReviewed: !!counterpartReview
          };
        })
      );
       // ── 2. Brand-creator collaborations (influencer only) ───────────────────
         // ── 2. Brand-creator collaborations (influencer only) ───────────────────
      let enrichedBrand: any[] = [];

      if (userType === 'influencer') {
        // Fetch ONLY scalar columns — no wildcard to avoid Supabase auto-joining
        // the `applications` FK which points to the wrong table for brand collabs.
        const { data: brandAgreementsRaw, error: bcError } = await supabase
          .from('brand_collaboration_agreements' as any)
          .select(
            'id, created_at, updated_at, agreed_at, status, campaign_id, application_id, ' +
            'brand_id, influencer_id, currency, deadline, total_fee, ' +
            'brand_signature_data, brand_legal_name, brand_signed_at, brand_ip_address, ' +
            'creator_signature_data, creator_legal_name, creator_signed_at, creator_ip_address, ' +
            'contract_version, deliverable_count'
          )
          .eq('influencer_id', userId)
          .order('created_at', { ascending: false });

        if (bcError) throw bcError;

        const brandAgreements = (brandAgreementsRaw ?? []) as any[];

        if (brandAgreements.length > 0) {
          // Fetch campaigns
          const campaignIds = [...new Set(brandAgreements.map((a: any) => a.campaign_id).filter(Boolean))];
          const { data: campaignsRaw } = campaignIds.length
            ? await supabase
                .from('brand_campaigns')
                .select('id, campaign_title, brand_name, deliverables, content_requirements, creator_payout, currency, timeline_start, timeline_end')
                .in('id', campaignIds)
            : { data: [] };
          const campaigns = (campaignsRaw ?? []) as any[];

          // Fetch brand_campaign_applications (the correct join table for brand-creator)
          const applicationIds = [...new Set(brandAgreements.map((a: any) => a.application_id).filter(Boolean))];
        
          const { data: brandAppsRaw } = applicationIds.length
            ? await supabase
                .from('brand_campaign_applications' as any)
                .select('id, influencer_id, campaign_id, cover_letter, proposed_content_ideas, portfolio_urls, previous_brand_work, follower_count_snapshot, engagement_rate_snapshot, status')

                .in('id', applicationIds)
            : { data: [] };
          const brandApps = (brandAppsRaw ?? []) as any[];

          // Fetch brand profiles
          const brandIds = [...new Set(brandAgreements.map((a: any) => a.brand_id).filter(Boolean))];
          const { data: brandProfilesRaw } = brandIds.length
            ? await supabase
                .from('profiles')
                .select('id, first_name, last_name, profile_photo_url')
                .in('id', brandIds)
            : { data: [] };
          const brandProfiles = (brandProfilesRaw ?? []) as any[];

          // Fetch influencer record for the current user
          const { data: influencerRaw } = await supabase
            .from('influencers')
            .select('id, instagram_url, total_followers, engagement_rate')
            .eq('id', userId)
            .single();

          // Fetch creator profile
          const { data: creatorProfileRaw } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, profile_photo_url, location')
            .eq('id', userId)
            .single();

          // Reviews
       // Fetch BRAND's reviews using brand_agreement_id column
       const brandAgreementIds = brandAgreements.map((a: any) => a.id) as string[];

       // Fetch BRAND's reviews using brand_agreement_id column
       const { data: brandReviewsRaw } = await (supabase as any)
         .from('reviews_and_ratings')
         .select('brand_agreement_id')
         .in('brand_agreement_id', brandAgreementIds)
         .eq('reviewer_type', 'brand');
       
       const brandReviewedIds = new Set(
         ((brandReviewsRaw ?? []) as any[]).map((r: any) => r.brand_agreement_id)
       );
       
       // Fetch MY reviews as creator
       const { data: myReviewsRaw } = await (supabase as any)
         .from('reviews_and_ratings')
         .select('brand_agreement_id')
         .eq('reviewer_id', userId)
         .in('brand_agreement_id', brandAgreementIds);
       
       const myReviewedIds = new Set(
         ((myReviewsRaw ?? []) as any[]).map((r: any) => r.brand_agreement_id)
       );
          enrichedBrand = brandAgreements.map((agreement: any) => {
            const campaign     = campaigns.find((c: any) => c.id === agreement.campaign_id) ?? null;
            const brandProfile = brandProfiles.find((p: any) => p.id === agreement.brand_id) ?? null;
            const brandApp     = brandApps.find((a: any) => a.id === agreement.application_id) ?? null;

            // Attach campaign, influencer, profile as plain fields — no auto-join pollution
            const enriched = {
              ...agreement,
              campaign,
              influencer: influencerRaw ?? null,
              profile:    creatorProfileRaw ?? null,
            };

            return normaliseBrandCollab(
              enriched,
              brandProfile,
              brandApp,
              influencerRaw ?? null,
              creatorProfileRaw ?? null,
              myReviewedIds.has(agreement.id),
              brandReviewedIds.has(agreement.id),
            );
          });
        }
      }
// console.log(enrichedBrand)
      // ── 3. Merge and sort by created_at desc ────────────────────────────────
      const all = [...enrichedCollaborations, ...enrichedBrand].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setCollaborations(all);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      toast({
        title: "Error",
        description: "Failed to load collaborations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCompleteModal = (collaboration: any, isReviewOnly: boolean = false) => {
    setCompleteModal({
      isOpen: true,
      collaboration,
      isReviewOnly
    });
  };

  const closeCompleteModal = () => {
    setCompleteModal({
      isOpen: false,
      collaboration: null,
      isReviewOnly: false
    });
  };

  const openContractModal = (collaboration: any) => {
    setContractModal({
      isOpen: true,
      collaboration
    });
  };

  const closeContractModal = () => {
    setContractModal({
      isOpen: false,
      collaboration: null
    });
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

  const handleContractSigned = (data: { signatureData: string; legalName: string }) => {
    if (!contractModal.collaboration) return;
    const isBrandCollab = contractModal.collaboration._source === 'brand_creator';
    signContract({
      agreementId: contractModal.collaboration.id,
      signatureData: data.signatureData,
      legalName: data.legalName,
      partyType: isBrandCollab && userType === 'influencer' ? 'creator' : userType,
    }, {
      onSuccess: () => {
        closeContractModal();
        fetchCollaborations();
      }
    });
  };

  const buildContractDataFromCollab = (collaboration: any) => {
    // ── Brand-creator collab ──────────────────────────────────────────────────
    if (collaboration._source === 'brand_creator') {
      const creatorName = collaboration.profile
        ? `${collaboration.profile.first_name ?? ''} ${collaboration.profile.last_name ?? ''}`.trim() || 'Creator'
        : 'Creator';
      const brandName = collaboration.counterpart
        ? `${collaboration.counterpart.first_name ?? ''} ${collaboration.counterpart.last_name ?? ''}`.trim() || 'Brand'
        : 'Brand';
      return {
        agreementId:            collaboration.id,
        propertyTitle:          collaboration.campaign?.campaign_title ?? 'Brand Campaign',
        propertyLocation:       collaboration.profile?.location ?? '',
        propertyType:           'Brand Campaign',
        hostName:               brandName,
        hostId:                 collaboration.brand_id,
        influencerName:         creatorName,
        influencerId:           collaboration.influencer_id,
        influencerFollowers:    collaboration.influencer?.total_followers,
        influencerInstagram:    collaboration.influencer?.instagram_url?.replace(/.*instagram\.com\//, '').replace(/\/$/, ''),
        checkInDate:            collaboration.campaign?.timeline_start ?? null,
        checkOutDate:           collaboration.campaign?.timeline_end ?? null,
        deliverables:           collaboration.campaign?.deliverables ?? [],
        deadline:               collaboration.deadline ?? null,
        collaborationType:      'paid',
        agreedRate:             collaboration.campaign?.creator_payout ?? null,
        currency:               collaboration.currency ?? 'USD',
        affiliateCommissionRate: 0,
      };
    }
    const app = collaboration.applications;
    const property = app?.properties;
    const host = property?.host;
    const influencer = app?.influencer;

    return {
      agreementId: collaboration.id,
      propertyTitle: property?.title || "Property",
      propertyLocation: property?.location || "Location TBD",
      propertyType: property?.property_type || "Accommodation",
      hostName: host?.profiles
        ? `${host.profiles.first_name || ""} ${host.profiles.last_name || ""}`.trim() || "Host"
        : "Host",
      hostId: collaboration.host_id ?? collaboration.brand_id,
      influencerName: influencer?.profiles
        ? `${influencer.profiles.first_name || ""} ${influencer.profiles.last_name || ""}`.trim() || "Creator"
        : "Creator",
      influencerId: collaboration.influencer_id,
      influencerFollowers: influencer?.total_followers,
      influencerInstagram: influencer?.instagram_url?.replace(/.*instagram\.com\//, "").replace(/\/$/, ""),
      checkInDate: app?.proposed_dates_start,
      checkOutDate: app?.proposed_dates_end,
      deliverables: app?.content_deliverables || collaboration.content_requirements || [],
      deadline: app?.content_deadline || collaboration.deadline,
      collaborationType: property?.collaboration_type || "free_stay",
      agreedRate: collaboration.agreed_rate,
      currency: collaboration.currency || "USD",
     affiliateCommissionRate: collaboration.affiliate_commission_rate || 0.10,
    };
  };

  // Determine if user needs to sign based on status and userType
  const needsToSign = (collaboration: any) => {
    if (collaboration.status === 'pending_influencer' && userType === 'influencer') return true;
    if (collaboration.status === 'pending_host' && userType === 'host') return true;
    return false;
  };

  // Determine if user is waiting for other party
  const isWaitingForOther = (collaboration: any) => {
    if (collaboration.status === 'pending_influencer' && userType === 'host') return true;
    if (collaboration.status === 'pending_host' && userType === 'influencer') return true;
    return false;
  };

  // Can view contract if it has been signed by at least one party or is active/completed
  const canViewContract = (collaboration: any) => {
    return ['pending_influencer', 'pending_host', 'active', 'completed'].includes(collaboration.status);
  };

  /** Returns the best display title for any collab regardless of source */
  const getCollabTitle = (collaboration: any): string => {
    // Brand-creator: campaign title is the primary label
    if (collaboration._source === 'brand_creator') {
      return collaboration.campaign?.campaign_title
        ?? collaboration.applications?.properties?.title
        ?? 'Brand Campaign';
    }
    // Host-influencer: property title from joined applications
    return collaboration.applications?.properties?.title ?? 'Collaboration';
  };

  if (loading) {
    return <div className="text-center py-8">Loading collaborations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">My Collaborations</h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {collaborations.length} Total
        </Badge>
      </div>

      {collaborations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No collaborations yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Approved applications will create collaboration agreements here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {collaborations.map((collaboration) => {
            const cardKey = `${collaboration._source ?? 'hi'}-${collaboration.id}`;
            const collabTitle = (() => { try { return getCollabTitle(collaboration); } catch(e) { console.error('getCollabTitle crash', collaboration.id, e); return 'Collaboration'; }})();
            return (
              
            <Card key={`${collaboration._source}-${collaboration.id}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="font-semibold text-lg">
                      {getCollabTitle(collaboration)}
                      </h3>
                      {/* Small pill indicating collab type */}
                      {collaboration._source === 'brand_creator' && (
                        <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                          Brand Campaign
                        </Badge>
                      )}
                      <Badge 
                        variant={
                          collaboration.status === 'completed' ? 'default' :
                          collaboration.status === 'active' ? 'secondary' :
                          'outline'
                        }
                        className={
                          collaboration.status === 'completed' ? 'bg-green-100 text-green-800' :
                          collaboration.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          collaboration.status === 'pending_influencer' ? 'bg-yellow-100 text-yellow-800' :
                          collaboration.status === 'pending_host' ? 'bg-yellow-100 text-yellow-800' :
                          ''
                        }
                      >
                        {collaboration.status === 'pending_influencer' ? 'Awaiting Creator' :
                         collaboration.status === 'pending_host' ? 'Awaiting Brand / Host' :
                         collaboration.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center space-x-2">
                        <span className="font-medium">
                          {userType === 'host' ? 'Creator:' : collaboration._source === 'brand_creator' ? 'Brand:' : 'Host:'}
                        </span>
                        <span>
                          {collaboration.counterpart.first_name} {collaboration.counterpart.last_name}
                        </span>
                      </p>
                      
                      <p className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {new Date(collaboration.agreed_at || collaboration.created_at).toLocaleDateString()}</span>
                      </p>

                      {collaboration.deadline && (
                        <p className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Deadline: {new Date(collaboration.deadline).toLocaleDateString()}</span>
                        </p>
                      )}

                      {collaboration._source !== 'brand_creator' && collaboration.agreed_rate != null && collaboration.agreed_rate > 0 && (
                        <p className="font-medium text-primary">
                          Rate: ${collaboration.agreed_rate / 100} {collaboration.currency?.toUpperCase()}
                        </p>
                      )}
                       {collaboration._source === 'brand_creator' && collaboration.campaign?.creator_payout != null && (
                        <p className="font-medium text-primary">
                          Payout: {collaboration.campaign.creator_payout} {collaboration.currency?.toUpperCase()}
                        </p>
                      
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 min-w-[140px]">
                    {/* Contract Actions */}
                    {needsToSign(collaboration) && (
                      <Button
                        size="sm"
                        onClick={() => openContractModal(collaboration)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <FileSignature className="w-4 h-4 mr-1" />
                        Sign Contract
                      </Button>
                    )}

                    {isWaitingForOther(collaboration) && (
                      <div className="flex items-center space-x-1 text-yellow-600 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Awaiting {userType === 'host' ? 'Creator' : 'Brand / Host'}</span>
                      </div>
                    )}

                    {canViewContract(collaboration) && !needsToSign(collaboration) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openViewModal(collaboration)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Contract
                      </Button>
                    )}

                    {/* Existing Actions */}
                    {collaboration.status === 'active' && (
                      <Button
                        size="sm"
                        onClick={() => openCompleteModal(collaboration, false)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}

                    {/* Leave Review button for completed collaborations where host hasn't reviewed */}
                    {collaboration.status === 'completed' && !collaboration.hasReviewed && (
                      <Button
                        size="sm"
                        onClick={() => openCompleteModal(collaboration, true)}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Leave Review
                      </Button>
                    )}

                    {collaboration.hasReviewed && (
                      <div className="flex items-center space-x-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Reviewed</span>
                      </div>
                    )}

                    {collaboration.counterpartHasReviewed && (
                      <div className="flex items-center space-x-1 text-blue-600 text-sm">
                        <Star className="w-4 h-4" />
                        <span>Got Review</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
                  
               
                  )      
                 
          })}
        </div>
      )}

      {contractModal.isOpen && contractModal.collaboration && (
        <CollaborationContractModal
          open={contractModal.isOpen}
          onOpenChange={closeContractModal}
          onContractSigned={handleContractSigned}
          contractData={buildContractDataFromCollab(contractModal.collaboration)}
          partyType={ contractModal.collaboration._source === 'brand_creator' && userType === 'influencer'
            ? 'creator'
            : userType}
          isSubmitting={isSigningContract}
        />
      )}

      {viewModal.isOpen && viewModal.collaboration && (
        <ContractViewModal
          open={viewModal.isOpen}
          onOpenChange={closeViewModal}
          contractData={buildContractDataFromCollab(viewModal.collaboration)}
          status={viewModal.collaboration.status}
          hostSignature={viewModal.collaboration.host_signature_data}
          influencerSignature={viewModal.collaboration.influencer_signature_data}
          hostLegalName={viewModal.collaboration.host_legal_name}
          influencerLegalName={viewModal.collaboration.influencer_legal_name}
          hostSignedAt={viewModal.collaboration.host_signed_at}
          influencerSignedAt={viewModal.collaboration.influencer_signed_at}
          partyType={viewModal.collaboration._source === 'brand_creator' ? 'brand' : 'host'}
        
        />
      )}

      {completeModal.isOpen && completeModal.collaboration && (
        <CompleteCollaborationModal
          isOpen={completeModal.isOpen}
          onClose={closeCompleteModal}
          collaboration={completeModal.collaboration}
          userId={userId}
          userType={userType}
          onComplete={fetchCollaborations}
          isReviewOnly={completeModal.isReviewOnly}
        />
      )}
    </div>
  );
};

export default CollaborationsList;
