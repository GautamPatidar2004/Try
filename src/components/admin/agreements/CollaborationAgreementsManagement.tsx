import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Handshake, CheckCircle2, XCircle, DollarSign, Clock } from "lucide-react";
import { useAgreementsManagement } from "@/hooks/useAgreementsManagement";
import { AgreementStatsCard } from "./AgreementStatsCard";
import { AgreementStatusChart } from "./AgreementStatusChart";
import { AgreementTimelineChart } from "./AgreementTimelineChart";
import { AgreementsHeader } from "./AgreementsHeader";
import { AgreementsTable } from "./AgreementsTable";
import { AgreementDetailModal } from "./AgreementDetailModal";

export const CollaborationAgreementsManagement = () => {
  const { agreements, isLoading, stats } = useAgreementsManagement();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgreement, setSelectedAgreement] = useState<any>(null);

  const filteredAgreements = agreements?.filter((agreement: any) => {
    const matchesSearch = 
      searchTerm === "" ||
      agreement.host?.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.host?.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.influencer?.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.influencer?.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.application?.property?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || agreement.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Collaboration Agreements</h2>
        <p className="text-muted-foreground">
          Manage all collaboration agreements between hosts and influencers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AgreementStatsCard
          title="Total Agreements"
          value={stats.total}
          icon={FileText}
        />
        <AgreementStatsCard
          title="Active Agreements"
          value={stats.active}
          icon={Handshake}
        />
        <AgreementStatsCard
          title="Pending Approval"
          value={stats.pending}
          icon={Clock}
        />
        <AgreementStatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle2}
        />
        <AgreementStatsCard
          title="Cancelled"
          value={stats.cancelled}
          icon={XCircle}
        />
        <AgreementStatsCard
          title="Total Value"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AgreementStatusChart data={{
          active: stats.active,
          pending: stats.pending,
          completed: stats.completed,
          cancelled: stats.cancelled,
        }} />
        <AgreementTimelineChart agreements={agreements || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          <AgreementsHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          <AgreementsTable
            agreements={filteredAgreements}
            onViewAgreement={setSelectedAgreement}
          />
        </CardContent>
      </Card>

      <AgreementDetailModal
        agreement={selectedAgreement}
        open={!!selectedAgreement}
        onOpenChange={(open) => !open && setSelectedAgreement(null)}
      />
    </div>
  );
};
