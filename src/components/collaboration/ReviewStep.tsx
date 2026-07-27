 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { Card, CardContent } from "@/components/ui/card";
 import { Star, User, MessageSquare, Award, ThumbsUp, ArrowLeft, ArrowRight } from "lucide-react";
 import { ReviewData } from "@/hooks/useCollaborationCompletion";
 
 interface ReviewStepProps {
   reviewData: ReviewData;
   onReviewChange: (data: Partial<ReviewData>) => void;
   onBack: () => void;
   onContinue: () => void;
   revieweeName: string;
   reviewerType: 'host' | 'influencer';
 }
 
 const ReviewStep = ({
   reviewData,
   onReviewChange,
   onBack,
   onContinue,
   revieweeName,
   reviewerType
 }: ReviewStepProps) => {
   const ratingLabels = {
     overall: "Overall Experience",
     communication: "Communication",
     quality: reviewerType === 'host' ? "Content Quality" : "Property/Service Quality",
     professionalism: "Professionalism"
   };
 
   const ratingIcons = {
     overall: <Award className="w-4 h-4 text-primary" />,
     communication: <MessageSquare className="w-4 h-4 text-blue-500" />,
     quality: <Star className="w-4 h-4 text-purple-500" />,
     professionalism: <User className="w-4 h-4 text-orange-500" />
   };
 
   const handleStarClick = (category: keyof typeof ratingLabels, rating: number) => {
     onReviewChange({ [category]: rating });
   };
 
   const StarRating = ({ 
     rating, 
     onRatingChange 
   }: { 
     rating: number; 
     onRatingChange: (rating: number) => void 
   }) => (
     <div className="flex space-x-1">
       {[1, 2, 3, 4, 5].map((star) => (
         <button
           key={star}
           type="button"
           onClick={() => onRatingChange(star)}
           className="focus:outline-none"
         >
           <Star
             className={`w-6 h-6 ${
               star <= rating
                 ? 'fill-yellow-400 text-yellow-400'
                 : 'text-muted-foreground/40 hover:text-yellow-400'
             } transition-colors`}
           />
         </button>
       ))}
     </div>
   );
 
   const canContinue = reviewData.overall > 0;
 
   return (
     <div className="space-y-6">
       <div className="text-center mb-4">
         <h3 className="text-lg font-semibold">Leave a Review</h3>
         <p className="text-sm text-muted-foreground">
           Rate your experience with <span className="font-medium">{revieweeName}</span>
         </p>
       </div>
 
       {/* Rating Categories */}
       <div className="space-y-3">
         {(Object.keys(ratingLabels) as Array<keyof typeof ratingLabels>).map((key) => (
           <Card key={key} className="border-l-4 border-l-primary">
             <CardContent className="p-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                   {ratingIcons[key]}
                   <span className="font-medium">{ratingLabels[key]}</span>
                   {key === 'overall' && <span className="text-destructive">*</span>}
                 </div>
                 <StarRating
                   rating={reviewData[key]}
                   onRatingChange={(rating) => handleStarClick(key, rating)}
                 />
               </div>
             </CardContent>
           </Card>
         ))}
       </div>
 
       {/* Written Review */}
       <div className="space-y-2">
         <label className="block text-sm font-medium">
           Written Review (Optional)
         </label>
         <Textarea
           placeholder={`Share your experience working with ${revieweeName}...`}
           value={reviewData.reviewText}
           onChange={(e) => onReviewChange({ reviewText: e.target.value })}
           rows={4}
           className="resize-none"
         />
       </div>
 
       {/* Would Work Again */}
       <div className="space-y-3">
         <label className="block text-sm font-medium">
           Would you work with {revieweeName} again?
         </label>
         <div className="flex space-x-4">
           <Button
             type="button"
             variant={reviewData.wouldWorkAgain === true ? "default" : "outline"}
             onClick={() => onReviewChange({ wouldWorkAgain: true })}
             className="flex items-center space-x-2"
           >
             <ThumbsUp className="w-4 h-4" />
             <span>Yes</span>
           </Button>
           <Button
             type="button"
             variant={reviewData.wouldWorkAgain === false ? "default" : "outline"}
             onClick={() => onReviewChange({ wouldWorkAgain: false })}
             className="flex items-center space-x-2"
           >
             <ThumbsUp className="w-4 h-4 rotate-180" />
             <span>No</span>
           </Button>
         </div>
       </div>
 
       {/* Action Buttons */}
       <div className="flex gap-3 pt-4">
         <Button
           variant="outline"
           onClick={onBack}
           className="flex-1"
         >
           <ArrowLeft className="w-4 h-4 mr-2" />
           Back
         </Button>
         <Button
           onClick={onContinue}
           disabled={!canContinue}
           className="flex-1"
         >
           Continue
           <ArrowRight className="w-4 h-4 ml-2" />
         </Button>
       </div>
     </div>
   );
 };
 
 export default ReviewStep;