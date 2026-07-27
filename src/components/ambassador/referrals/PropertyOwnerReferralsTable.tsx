import { BaseReferralTable } from "./BaseReferralTable";
import { ReferralWithDetails } from "@/hooks/useAmbassadorReferrals";

interface PropertyOwnerReferralsTableProps {
  referrals: ReferralWithDetails[];
}

export const PropertyOwnerReferralsTable = ({ referrals }: PropertyOwnerReferralsTableProps) => {
  return (
    <BaseReferralTable
      referrals={referrals}
      referralType="property_owner"
      emptyMessage="No property owner referrals yet. Refer hotels and vacation rentals to earn $500 per successful listing!"
    />
  );
};
