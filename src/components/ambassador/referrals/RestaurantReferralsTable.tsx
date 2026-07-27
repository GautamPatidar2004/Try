import { BaseReferralTable } from "./BaseReferralTable";
import { ReferralWithDetails } from "@/hooks/useAmbassadorReferrals";

interface RestaurantReferralsTableProps {
  referrals: ReferralWithDetails[];
}

export const RestaurantReferralsTable = ({ referrals }: RestaurantReferralsTableProps) => {
  return (
    <BaseReferralTable
      referrals={referrals}
      referralType="restaurant"
      emptyMessage="No restaurant referrals yet. Refer restaurants to earn $100 per verified listing!"
    />
  );
};
