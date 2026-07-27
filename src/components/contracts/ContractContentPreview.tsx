import { format } from "date-fns";
 import { Building, User, Calendar, Package, FileText, Scale, Percent , Briefcase, DollarSign} from "lucide-react";

interface ContractData {
  agreementId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyType: string;
  hostName: string;
  hostId: string;
  influencerName: string;
  influencerId: string;
  influencerFollowers?: number;
  influencerInstagram?: string;
  checkInDate?: string;
  checkOutDate?: string;
  deliverables: string[];
  deadline?: string;
  collaborationType: string;
  agreedRate?: number;
  currency?: string;
   affiliateCommissionRate?: number;
  campaignTitle?: string;
   brandName?: string;
}

interface ContractContentPreviewProps {
  data: ContractData;
}

export const ContractContentPreview = ({ data }: ContractContentPreviewProps) => {
  const isBrandCampaign = data.collaborationType === "brand_campaign";
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    return format(new Date(dateStr), "MMMM d, yyyy");
  };

  const getCollaborationValue = () => {
    switch (data.collaborationType) {
      case "free_stay":
        return "Complimentary Stay";
      case "discount":
        return `Discounted Stay${data.agreedRate ? ` (${data.agreedRate}% off)` : ""}`;
      case "paid":
        return data.agreedRate 
          ? `${data.currency || "USD"} ${data.agreedRate.toLocaleString()}`
          : "Paid Collaboration";
          case "brand_campaign":
            return data.agreedRate
              ? `${data.currency || "USD"} ${data.agreedRate.toLocaleString()}`
              : "Flat Fee (to be confirmed)";
      default:
        return data.collaborationType || "To be determined";
    }
  };
// ── BRAND CAMPAIGN CONTRACT ──────────────────────────────────────────────────
if (isBrandCampaign) {
  return (
    <div className="space-y-6 text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center border-b border-border pb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          HOSTFLUENCER BRAND COLLABORATION AGREEMENT
        </h1>
        <p className="text-muted-foreground">
          This Brand Collaboration Agreement ("Agreement") is entered into as of{" "}
          <span className="font-medium text-foreground">
            {format(new Date(), "MMMM d, yyyy")}
          </span>
        </p>
      </div>

      {/* Parties */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Parties</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-semibold text-foreground mb-1">BRAND</p>
            <p className="text-foreground">{data.hostName}</p>
            <p className="text-muted-foreground text-xs mt-1">
              Campaign: {data.propertyTitle}
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-semibold text-foreground mb-1">CREATOR</p>
            <p className="text-foreground">{data.influencerName}</p>
            {data.influencerInstagram && (
              <p className="text-muted-foreground text-xs mt-1">
                @{data.influencerInstagram}
                {data.influencerFollowers && ` • ${data.influencerFollowers.toLocaleString()} followers`}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Campaign Details */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">1. Campaign Details</h2>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <p><span className="font-medium">Campaign:</span> {data.propertyTitle}</p>
          <p><span className="font-medium">Brand:</span> {data.hostName}</p>
          <p><span className="font-medium">Type:</span> UGC Content Production</p>
          <p><span className="font-medium">Deadline:</span> {formatDate(data.deadline)}</p>
        </div>
      </section>

      {/* Compensation */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">2. Compensation</h2>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <div className="p-3 bg-background rounded-lg border border-border">
            <p className="text-center">
              <span className="text-muted-foreground">Total Creator Fee:</span>
              <span className="text-2xl font-bold text-primary ml-2">
                {getCollaborationValue()}
              </span>
            </p>
          </div>
          <p className="text-muted-foreground text-xs pt-1">
            Fee is fixed and not contingent on content performance. Payment issued via the
            HostFluencer platform upon final asset approval.
          </p>
        </div>
      </section>

      {/* Content Deliverables */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">3. Content Deliverables</h2>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <p className="text-muted-foreground">
            The Creator agrees to produce the following content within the campaign window:
          </p>
          {data.deliverables && data.deliverables.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {data.deliverables.map((item, index) => (
                <li key={index} className="text-foreground">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">
              Deliverables as specified in the campaign brief
            </p>
          )}
          <p className="mt-2">
            <span className="font-medium">Content Due:</span> {formatDate(data.deadline)}
          </p>
        </div>
      </section>

      {/* Content Licensing */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Scale className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">4. Content Licensing and Usage Rights</h2>
        </div>
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
          <p className="font-medium text-foreground">
            The Creator grants the Brand a license to use all content produced under this
            Agreement for the following purposes and duration:
          </p>
          <div>
            <p className="font-medium text-foreground mb-2">Usage rights granted to Brand:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>12 months paid social amplification across Meta, TikTok, YouTube, and brand-owned channels</li>
              <li>Whitelisting, Spark Ads, and Partnership Ads for the usage term</li>
              <li>12 months organic use on brand website, app store listings, and email</li>
              <li>Use on niche faceless channels owned by the Brand</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-foreground mb-2">The Creator retains:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Underlying authorship of all content created</li>
              <li>The right to display work in their portfolio</li>
              <li>The right to post on their own channels</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Non-exclusive: Creator may continue working with non-competing brands.
            Exclusivity from direct competitors applies for the campaign window plus 30 days.
          </p>
        </div>
      </section>

      {/* Review and Approval */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">5. Review, Approval and General Terms</h2>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg space-y-3 text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Concept Submission:</span> Creator
            submits a written concept or rough storyboard within 5 business days of agreement
            acceptance.
          </p>
          <p>
            <span className="font-medium text-foreground">Revisions:</span> Up to 2 rounds of
            revisions included. Additional rounds billed separately.
          </p>
          <p>
            <span className="font-medium text-foreground">FTC Disclosure:</span> Creator must
            include #ad or #sponsored in captions plus a paid partnership tag where supported.
          </p>
          <p>
            <span className="font-medium text-foreground">Kill Fee:</span> If the Brand cancels
            after agreement acceptance but before draft delivery, the 50% deposit is retained by
            the Creator. If cancelled after draft delivery, 100% of the fee is due.
          </p>
          <p>
            <span className="font-medium text-foreground">Independent Contractor:</span> Creator
            is an independent contractor responsible for their own taxes. No employment
            relationship is created by this Agreement.
          </p>
          <p>
            <span className="font-medium text-foreground">Dispute Resolution:</span> Any disputes
            will be resolved through HostFluencer's mediation process.
          </p>
          <p>
            <span className="font-medium text-foreground">Governing Law:</span> This agreement
            is governed by applicable law and the HostFluencer platform terms of service.
          </p>
        </div>
      </section>

      {/* Agreement Version */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
        <p>HostFluencer Brand Collaboration Agreement • Version 1.0</p>
        <p>Agreement ID: {data.agreementId}</p>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6 text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center border-b border-border pb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          HOSTFLUENCER COLLABORATION AGREEMENT
        </h1>
        <p className="text-muted-foreground">
          This Collaboration Agreement ("Agreement") is entered into as of{" "}
          <span className="font-medium text-foreground">
            {format(new Date(), "MMMM d, yyyy")}
          </span>
        </p>
      </div>

      {/* Parties */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Parties</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-semibold text-foreground mb-1">HOST</p>
            <p className="text-foreground">{data.hostName}</p>
            <p className="text-muted-foreground text-xs mt-1">
              Property: {data.propertyTitle}
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-semibold text-foreground mb-1">CREATOR</p>
            <p className="text-foreground">{data.influencerName}</p>
            {data.influencerInstagram && (
              <p className="text-muted-foreground text-xs mt-1">
                @{data.influencerInstagram}
                {data.influencerFollowers && ` • ${data.influencerFollowers.toLocaleString()} followers`}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Building className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">1. Property Details</h2>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <p><span className="font-medium">Property:</span> {data.propertyTitle}</p>
          <p><span className="font-medium">Location:</span> {data.propertyLocation}</p>
          <p><span className="font-medium">Type:</span> {data.propertyType}</p>
        </div>
      </section>

      {/* Collaboration Dates */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">2. Collaboration Dates</h2>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg">
          <p>
            <span className="font-medium">Check-in:</span> {formatDate(data.checkInDate)}
          </p>
          <p>
            <span className="font-medium">Check-out:</span> {formatDate(data.checkOutDate)}
          </p>
          <p className="mt-2">
            <span className="font-medium">Value Exchange:</span> {getCollaborationValue()}
          </p>
        </div>
      </section>

      {/* Content Deliverables */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">3. Content Deliverables</h2>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <p className="text-muted-foreground">
            The Creator agrees to produce the following content:
          </p>
          {data.deliverables && data.deliverables.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {data.deliverables.map((item, index) => (
                <li key={index} className="text-foreground">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">No specific deliverables specified</p>
          )}
          <p className="mt-2">
            <span className="font-medium">Deadline:</span> {formatDate(data.deadline)}
          </p>
        </div>
      </section>

      {/* Content Licensing */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Scale className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">4. Content Licensing and Ownership</h2>
        </div>
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
          <p className="font-medium text-foreground">
            Upon delivery of the content, all materials created during the collaboration become 
            the exclusive property of the Host.
          </p>
          
          <div>
            <p className="font-medium text-foreground mb-2">The Creator grants to the Host:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>A perpetual, worldwide, royalty-free license to the content</li>
              <li>The right to use, reproduce, modify, and distribute the content</li>
              <li>The right to use the content for marketing, advertising, and promotional purposes</li>
              <li>The right to sublicense the content to third parties</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-foreground mb-2">The Creator retains:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>The right to display the content in their personal portfolio</li>
              <li>The right to post the content on their own social media channels</li>
              <li>Credit attribution where commercially reasonable</li>
            </ul>
          </div>
        </div>
      </section>

      {/* General Terms */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">5. General Terms</h2>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg space-y-3 text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Cancellation:</span> Either party may 
            cancel with 48 hours notice. Cancellations within 48 hours may result in penalties.
          </p>
          <p>
            <span className="font-medium text-foreground">Conduct:</span> Both parties agree to 
            maintain professional conduct throughout the collaboration.
          </p>
          <p>
            <span className="font-medium text-foreground">Dispute Resolution:</span> Any disputes 
            will be resolved through HostFluencer's mediation process.
          </p>
          <p>
            <span className="font-medium text-foreground">Governing Law:</span> This agreement 
            is governed by the laws of the jurisdiction where the property is located.
          </p>
        </div>
      </section>

       {/* Affiliate Commission Program */}
       <section>
         <div className="flex items-center gap-2 mb-3">
           <Percent className="h-5 w-5 text-primary" />
           <h2 className="text-lg font-semibold">6. Affiliate Commission Program</h2>
         </div>
         <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
           <p className="text-muted-foreground">
             Upon successful completion of this collaboration, the Creator will receive a unique 
             affiliate code to promote the property.
           </p>
           
           <div className="p-3 bg-background rounded-lg border border-border">
             <p className="text-center">
               <span className="text-muted-foreground">Agreed Commission Rate:</span>
               <span className="text-2xl font-bold text-primary ml-2">
                 {((data.affiliateCommissionRate || 0.10) * 100).toFixed(0)}%
               </span>
             </p>
           </div>
 
           <div>
             <p className="font-medium text-foreground mb-2">The Creator agrees to:</p>
             <ul className="list-disc list-inside space-y-1 text-muted-foreground">
               <li>Promote their affiliate code in created content</li>
               <li>Drive bookings using their unique promotional code</li>
               <li>Earn commission on confirmed bookings made with their code</li>
             </ul>
           </div>
 
           <div>
             <p className="font-medium text-foreground mb-2">The Host agrees to:</p>
             <ul className="list-disc list-inside space-y-1 text-muted-foreground">
               <li>Honor the stated commission rate on all qualified bookings</li>
               <li>Log conversions when bookings are made using the Creator's code</li>
               <li>Pay commissions on confirmed bookings via the platform's payout system</li>
             </ul>
           </div>
 
           <p className="text-xs text-muted-foreground italic">
             Commissions are calculated on the booking total and paid via the HostFluencer platform 
             once bookings are confirmed by the Host.
           </p>
         </div>
       </section>
 
      {/* Agreement Version */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
        <p>HostFluencer Collaboration Agreement • Version 1.0</p>
        <p>Agreement ID: {data.agreementId}</p>
      </div>
    </div>
  );
};
