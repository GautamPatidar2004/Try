import { BaseReferralTable } from "./BaseReferralTable";
import { ReferralWithDetails } from "@/hooks/useAmbassadorReferrals";

interface BrandReferralsTableProps {
  referrals: ReferralWithDetails[];
}

export const BrandReferralsTable = ({ referrals }: BrandReferralsTableProps) => {
  return (
    <BaseReferralTable
      referrals={referrals}
      referralType="brand"
      emptyMessage="No brand referrals yet. Introduce brands to earn 15% on their campaign fees!"
    />
  );
};
