import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyFormData, CONTENT_REQUIREMENTS } from "../propertyFormSchema";
import PricingExplainer from "../components/PricingExplainer";
import { DollarSign, Info, Gift } from "lucide-react";

const CollaborationStep = () => {
  const { control, watch, setValue } = useFormContext<PropertyFormData>();
  const contentRequirements = watch("content_requirements") || [];
  const campaignRate = watch("campaign_rate");

  const handleContentRequirementChange = (requirement: string, checked: boolean) => {
    if (checked) {
      setValue("content_requirements", [...contentRequirements, requirement]);
    } else {
      setValue("content_requirements", contentRequirements.filter((r) => r !== requirement));
    }
  };

  const campaignRateDollars = campaignRate ? campaignRate / 100 : 0;
  const platformFee = campaignRateDollars * 0.2;
  const creatorPayout = campaignRateDollars * 0.8;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Collaboration Settings</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Define how you'd like to collaborate with content creators.
        </p>
      </div>

      {/* Free Stay Info */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <Gift className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Creators stay for free</p>
          <p className="text-xs text-muted-foreground mt-1">
            As part of your campaign listing, creators will receive a complimentary stay at your property in exchange for content creation.
          </p>
        </div>
      </div>

      {/* Campaign Rate - Required */}
      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-base">Campaign Listing Rate *</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Set the total campaign budget for your property listing. This is the amount you pay to list your property on Hostfluencer. Minimum $250.
        </p>
        <FormField
          control={control}
          name="campaign_rate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative max-w-[250px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <Input
                    type="number"
                    min="250"
                    step="50"
                    placeholder="250"
                    className="pl-7 text-lg font-semibold"
                    value={field.value ? field.value / 100 : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : Math.round(parseFloat(value) * 100));
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pricing Breakdown */}
        {campaignRate && campaignRate >= 25000 && (
          <div className="bg-background rounded-md p-4 space-y-2 text-sm border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campaign Rate</span>
              <span className="font-medium">${campaignRateDollars.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (20%)</span>
              <span className="text-muted-foreground">-${platformFee.toFixed(2)}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between font-semibold">
              <span>Creator Payout (80%)</span>
              <span className="text-primary">${creatorPayout.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded p-3">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <p>You will be redirected to Stripe to complete payment after submitting. Your listing will go live once payment is confirmed.</p>
        </div>
      </div>

      {/* Pricing Explainer */}
      <PricingExplainer />

      <div>
        <FormLabel className="text-base font-medium">Content Requirements</FormLabel>
        <p className="text-sm text-muted-foreground mb-4">What type of content would you like creators to produce?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CONTENT_REQUIREMENTS.map((requirement) => (
            <div key={requirement} className="flex items-center space-x-2">
              <Checkbox
                id={requirement}
                checked={contentRequirements.includes(requirement)}
                onCheckedChange={(checked) => handleContentRequirementChange(requirement, checked as boolean)}
              />
              <label
                htmlFor={requirement}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {requirement}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollaborationStep;
