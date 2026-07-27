 interface PriceBreakdownProps {
   baseRate: number;
   discountPercentage: number;
   collaborationType: string;
 }
 
 const PriceBreakdown = ({ baseRate, discountPercentage, collaborationType }: PriceBreakdownProps) => {
   const baseInDollars = baseRate / 100;
   const discountAmount = baseInDollars * (discountPercentage / 100);
   const creatorPays = collaborationType === 'free_stay' ? 0 : baseInDollars - discountAmount;
   
   return (
     <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border">
       <h4 className="font-medium text-sm text-foreground">Price Breakdown</h4>
       <div className="space-y-1 text-sm">
         <div className="flex justify-between">
           <span className="text-muted-foreground">Your standard rate:</span>
           <span className="font-medium text-foreground">${baseInDollars.toFixed(0)} / night</span>
         </div>
         {collaborationType !== 'paid' && discountPercentage > 0 && (
           <>
             <div className="flex justify-between text-green-600 dark:text-green-400">
               <span>Creator discount ({discountPercentage}%):</span>
               <span>- ${discountAmount.toFixed(0)}</span>
             </div>
             <div className="border-t border-border pt-2 flex justify-between font-semibold">
               <span className="text-foreground">Creator pays:</span>
               <span className="text-emerald-600 dark:text-emerald-400">
                 {creatorPays === 0 ? 'FREE' : `$${creatorPays.toFixed(0)} / night`}
               </span>
             </div>
           </>
         )}
         {collaborationType === 'paid' && (
           <div className="border-t border-border pt-2 flex justify-between font-semibold">
             <span className="text-foreground">Creator pays:</span>
             <span className="text-foreground">${baseInDollars.toFixed(0)} / night</span>
           </div>
         )}
         {collaborationType === 'free_stay' && (
           <div className="border-t border-border pt-2 flex justify-between font-semibold">
             <span className="text-foreground">Creator pays:</span>
             <span className="text-emerald-600 dark:text-emerald-400">FREE</span>
           </div>
         )}
       </div>
       <p className="text-xs text-muted-foreground pt-2">
         💡 The discount is the value you provide to creators in exchange for their content and promotion.
       </p>
     </div>
   );
 };
 
 export default PriceBreakdown;