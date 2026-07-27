 import { useState } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 
 export interface ContentData {
   file: File | null;
   caption: string;
   hashtags: string;
   mentions: string;
   mediaUrl: string | null;
 }
 
 export interface ReviewData {
   overall: number;
   communication: number;
   quality: number;
   professionalism: number;
   reviewText: string;
   wouldWorkAgain: boolean | null;
 }
 
interface UseCollaborationCompletionProps {
  collaboration: any;
  userId: string;
  userType: 'host' | 'influencer';
  onComplete: () => void;
  onClose: () => void;
  isReviewOnly?: boolean;
}
 
export const useCollaborationCompletion = ({
  collaboration,
  userId,
  userType,
  onComplete,
  onClose,
  isReviewOnly = false
}: UseCollaborationCompletionProps) => {
  // Hosts skip content upload step, so they start at step 1 (which maps to Review)
  // Influencers have 3 steps: Content Upload (1) -> Review (2) -> Confirm (3)
  // Hosts have 2 steps: Review (1) -> Confirm (2)
  const isHost = userType === 'host';
  const totalSteps = isHost ? 2 : 3;
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentData, setContentData] = useState<ContentData>({
    file: null,
    caption: "",
    hashtags: "",
    mentions: "",
    mediaUrl: null
  });
  const [reviewData, setReviewData] = useState<ReviewData>({
    overall: 0,
    communication: 0,
    quality: 0,
    professionalism: 0,
    reviewText: "",
    wouldWorkAgain: null
  });
  const { toast } = useToast();

  const goToStep = (newStep: number) => {
    setStep(newStep);
  };
 
   const uploadContent = async (): Promise<string | null> => {
     if (!contentData.file) return null;
 
     const fileExt = contentData.file.name.split('.').pop();
     const fileName = `stays/${userId}/${collaboration.id}/${Date.now()}.${fileExt}`;
 
     const { data: uploadData, error: uploadError } = await supabase.storage
       .from('collaboration-content')
       .upload(fileName, contentData.file);
 
     if (uploadError) throw uploadError;
 
     const { data: { publicUrl } } = supabase.storage
       .from('collaboration-content')
       .getPublicUrl(fileName);
 
     return publicUrl;
   };
 
   const saveContentPost = async (mediaUrl: string) => {
    const isBrandCollab = collaboration._source === 'brand_creator';
  
    const contentPostData = isBrandCollab
      ? {
          influencer_id: userId,
          brand_campaign_application_id: collaboration.application_id,
          campaign_id: collaboration.campaign_id,
          media_type: contentData.file?.type?.startsWith('video') ? 'video' : 'image',
          media_url: mediaUrl,
          caption: contentData.caption || null,
          hashtags: contentData.hashtags ? contentData.hashtags.split(',').map(h => h.trim()) : null,
          mentions: contentData.mentions ? contentData.mentions.split(',').map(m => m.trim()) : null,
          delivery_status: 'submitted',
          host_approval_status: 'pending'
        }
      : {
          influencer_id: userId,
          application_id: collaboration.application_id,
          media_type: contentData.file?.type?.startsWith('video') ? 'video' : 'image',
          media_url: mediaUrl,
          caption: contentData.caption || null,
          hashtags: contentData.hashtags ? contentData.hashtags.split(',').map(h => h.trim()) : null,
          mentions: contentData.mentions ? contentData.mentions.split(',').map(m => m.trim()) : null,
          delivery_status: 'submitted',
          host_approval_status: 'pending'
        };
  
    const { error } = await supabase
      .from('content_posts')
      .insert(contentPostData as any);
  
    if (error) throw error;
  };
 
   const submitReview = async () => {
    const isBrandCollab = collaboration._source === 'brand_creator';
    const revieweeId = isBrandCollab ? collaboration.brand_id : userType === 'host' ? collaboration.influencer_id : collaboration.host_id;
    const insertPayload = isBrandCollab
    ? {
        brand_agreement_id: collaboration.id,
        reviewer_id: userId,
        reviewee_id: revieweeId,
        reviewer_type: 'influencer',
        rating: reviewData.overall,
        communication_rating: reviewData.communication || null,
        quality_rating: reviewData.quality || null,
        professionalism_rating: reviewData.professionalism || null,
        review_text: reviewData.reviewText.trim() || null,
        would_work_again: reviewData.wouldWorkAgain
      }
    : {
        agreement_id: collaboration.id,
        reviewer_id: userId,
        reviewee_id: revieweeId,
        reviewer_type: userType,
        rating: reviewData.overall,
        communication_rating: reviewData.communication || null,
        quality_rating: reviewData.quality || null,
        professionalism_rating: reviewData.professionalism || null,
        review_text: reviewData.reviewText.trim() || null,
        would_work_again: reviewData.wouldWorkAgain
      };
     const { error } = await supabase
       .from('reviews_and_ratings')
       .insert(insertPayload as any);
 
     if (error) throw error;
   };
 
   const completeCollaboration = async () => {
    const isBrandCollab = collaboration._source === 'brand_creator';
  
    if (isBrandCollab) {
      const { error: statusError } = await supabase
        .from('brand_collaboration_agreements' as any)
        .update({ status: 'completed' })
        .eq('id', collaboration.id);
  
      if (statusError) throw statusError;
    } else {
      const { error: statusError } = await supabase
        .from('collaboration_agreements')
        .update({ status: 'completed' })
        .eq('id', collaboration.id);
  
      if (statusError) throw statusError;
  
      // Update content delivery status if content was uploaded
      if (contentData.mediaUrl) {
        await supabase
          .from('applications')
          .update({
            content_delivery_status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('id', collaboration.application_id);
      }
    }
  };
 
   const handleFinalSubmit = async () => {
     if (reviewData.overall === 0) {
       toast({
         title: "Rating Required",
         description: "Please provide an overall rating before completing",
         variant: "destructive",
       });
       return;
     }
 
     setIsSubmitting(true);
     try {
       // Upload content if provided
       if (contentData.file) {
         const mediaUrl = await uploadContent();
         if (mediaUrl) {
           await saveContentPost(mediaUrl);
           setContentData(prev => ({ ...prev, mediaUrl }));
         }
       }
 
      // Submit review
      await submitReview();

      // Complete collaboration (skip if review-only mode)
      if (!isReviewOnly) {
        await completeCollaboration();
      }
 
      toast({
        title: isReviewOnly ? "Review Submitted!" : "Collaboration Completed!",
        description: isReviewOnly ? "Thank you for your feedback." : "Thank you for your feedback and content delivery.",
      });
 
       onComplete();
       onClose();
     } catch (error) {
       console.error('Error completing collaboration:', error);
       toast({
         title: "Error",
         description: "Failed to complete collaboration. Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
  return {
    step,
    goToStep,
    contentData,
    setContentData,
    reviewData,
    setReviewData,
    isSubmitting,
    handleFinalSubmit,
    isHost,
    totalSteps
  };
};