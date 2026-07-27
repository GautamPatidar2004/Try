 import { Info } from "lucide-react";
 import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
 
 const PricingExplainer = () => (
   <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
     <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
     <AlertTitle className="text-blue-800 dark:text-blue-300">How Pricing Works</AlertTitle>
     <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm space-y-2">
       <p>
         <strong>Base Rate:</strong> Your standard nightly rate (e.g., what you charge on Airbnb).
       </p>
       <p>
         <strong>Creator Discount:</strong> The percentage off you offer creators in exchange for content.
       </p>
       <p>
         <strong>Example:</strong> $300/night with 50% discount = Creator pays $150/night. 
         The $150 savings is the value you provide for their content creation.
       </p>
     </AlertDescription>
   </Alert>
 );
 
 export default PricingExplainer;