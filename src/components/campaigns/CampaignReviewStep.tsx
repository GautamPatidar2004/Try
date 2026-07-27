import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { CampaignFormData } from "./CampaignCreateForm";

interface CampaignReviewStepProps {
  formData: CampaignFormData;
}

const CampaignReviewStep = ({ formData }: CampaignReviewStepProps) => {
  const isGifted = formData.compensation_type === "gifted";
  const isAffiliate = formData.compensation_type === "affiliate";

  const followerLabel = {
    "1000": "1K+",
    "5000": "5K+",
    "10000": "10K+",
    "50000": "50K+",
    "100000": "100K+",
  }[formData.min_followers] || formData.min_followers;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Campaign</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Details */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Campaign Details</h3>
          <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
  <dt className="text-muted-foreground">Campaign For</dt>
  <dd className="font-medium text-foreground">
    {formData.campaign_subject_type === "platform_brand" && "Platform Brand"}
    {formData.campaign_subject_type === "property_stay" && "Property Stay"}

  </dd>
</div>

{formData.campaign_subject_type === "property_stay" && formData.property_id && (
  <div className="flex justify-between">
    <dt className="text-muted-foreground">Property ID</dt>
    <dd className="font-medium text-foreground">
      {formData.property_id}
    </dd>
  </div>
)}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Campaign Name</dt>
              <dd className="font-medium text-foreground">{formData.campaign_title}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Compensation</dt>
              <dd className="font-medium text-foreground">
                <Badge variant={isGifted || isAffiliate ? "secondary" : "default"}>
                  {isGifted ? "Gifted (Product)" : isAffiliate ? "Affiliate" : "Paid"}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium text-foreground">{formData.campaign_type}</dd>
            </div>
            {formData.target_destination && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Target Destination</dt>
                <dd className="font-medium text-foreground">{formData.target_destination}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Deliverables</dt>
              <dd className="font-medium text-foreground">{formData.deliverables_count} piece(s)</dd>
            </div>
            {!isGifted && !isAffiliate && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Budget</dt>
                <dd className="font-medium text-foreground">${formData.total_budget.toLocaleString()}</dd>
              </div>
            )}
            {isAffiliate && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Commission Rate</dt>
                <dd className="font-medium text-foreground">{formData.affiliate_percentage}%</dd>
              </div>
            )}
            {formData.start_date && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Start Date</dt>
                <dd className="font-medium text-foreground">{format(formData.start_date, "PPP")}</dd>
              </div>
            )}
            {formData.end_date && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">End Date</dt>
                <dd className="font-medium text-foreground">{format(formData.end_date, "PPP")}</dd>
              </div>
            )}
          </dl>
          <div className="mt-2">
            <dt className="text-sm text-muted-foreground mb-1">Description</dt>
            <dd className="text-sm text-foreground bg-muted/50 rounded-md p-3">{formData.campaign_description}</dd>
          </div>
          {isGifted && formData.product_description && (
            <div className="mt-2">
              <dt className="text-sm text-muted-foreground mb-1">Product/Gift Description</dt>
              <dd className="text-sm text-foreground bg-muted/50 rounded-md p-3">{formData.product_description}</dd>
            </div>
          )}
        </div>

        {/* Creator Targeting */}
        <div className="border-t border-border pt-4">
          <h3 className="font-semibold text-foreground mb-3">Creator Targeting</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground mb-1">Niches</dt>
              <dd className="flex flex-wrap gap-1.5">
                {formData.creator_niche.map(n => (
                  <Badge key={n} variant="secondary">{n}</Badge>
                ))}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Min Followers</dt>
              <dd className="font-medium text-foreground">{followerLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Creators Needed</dt>
              <dd className="font-medium text-foreground">{formData.creators_needed}</dd>
            </div>
            {formData.geo_focus && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Geographic Focus</dt>
                <dd className="font-medium text-foreground">{formData.geo_focus}</dd>
              </div>
            )}
          </dl>
          {formData.requirements && (
            <div className="mt-2">
              <dt className="text-sm text-muted-foreground mb-1">Additional Requirements</dt>
              <dd className="text-sm text-foreground bg-muted/50 rounded-md p-3">{formData.requirements}</dd>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignReviewStep;
