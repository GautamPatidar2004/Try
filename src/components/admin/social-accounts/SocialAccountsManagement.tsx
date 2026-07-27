import { useSocialAccountsManagement, SocialAccount } from '@/hooks/useSocialAccountsManagement';
import { SocialAccountStatsCard } from './SocialAccountStatsCard';
import { PlatformDistributionChart } from './PlatformDistributionChart';
import { VerificationStatusChart } from './VerificationStatusChart';
import { SocialAccountsHeader } from './SocialAccountsHeader';
import { SocialAccountsTable } from './SocialAccountsTable';
import { SocialAccountDetailModal } from './SocialAccountDetailModal';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export const SocialAccountsManagement = () => {
  const {
    accounts,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    platformFilter,
    setPlatformFilter,
    verificationFilter,
    setVerificationFilter,
    verifyAccount,
    unverifyAccount,
    updateFollowerCount,
    deleteAccount,
  } = useSocialAccountsManagement();

  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (account: SocialAccount) => {
    setSelectedAccount(account);
    setIsDetailModalOpen(true);
  };

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading social accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Social Accounts Verification</h2>
        <p className="text-muted-foreground">
          Manage and verify influencer social media accounts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SocialAccountStatsCard
          title="Total Accounts"
          value={stats.total}
          icon={Users}
          description="All connected social accounts"
        />
        <SocialAccountStatsCard
          title="Verified"
          value={stats.verified}
          icon={CheckCircle}
          description={`${stats.total > 0 ? ((stats.verified / stats.total) * 100).toFixed(1) : 0}% verification rate`}
        />
        <SocialAccountStatsCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          description="Awaiting verification"
        />
        <SocialAccountStatsCard
          title="Total Reach"
          value={formatFollowerCount(stats.totalReach)}
          icon={TrendingUp}
          description={`${stats.totalReach.toLocaleString()} total followers`}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <PlatformDistributionChart data={stats.platformBreakdown} />
        <VerificationStatusChart verified={stats.verified} pending={stats.pending} />
      </div>

      {/* Filters and Table */}
      <div className="space-y-4">
        <SocialAccountsHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          platformFilter={platformFilter}
          onPlatformChange={setPlatformFilter}
          verificationFilter={verificationFilter}
          onVerificationChange={setVerificationFilter}
        />

        <SocialAccountsTable
          accounts={accounts}
          onViewDetails={handleViewDetails}
          onVerify={verifyAccount}
          onUnverify={unverifyAccount}
        />
      </div>

      {/* Detail Modal */}
      <SocialAccountDetailModal
        account={selectedAccount}
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAccount(null);
        }}
        onVerify={verifyAccount}
        onUnverify={unverifyAccount}
        onUpdateFollowers={updateFollowerCount}
        onDelete={deleteAccount}
      />
    </div>
  );
};
