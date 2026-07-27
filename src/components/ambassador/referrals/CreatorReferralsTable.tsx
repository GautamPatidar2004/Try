import { BaseReferralTable } from "./BaseReferralTable";
import { ReferralWithDetails } from "@/hooks/useAmbassadorReferrals";

interface CreatorReferralsTableProps {
  referrals: ReferralWithDetails[];
}

export const CreatorReferralsTable = ({ referrals }: CreatorReferralsTableProps) => {
  return (
    <BaseReferralTable
      referrals={referrals}
      referralType="creator"
      emptyMessage="No creator referrals yet. Share your link with influencers to earn 20% recurring commission!"
    />
  );
};
