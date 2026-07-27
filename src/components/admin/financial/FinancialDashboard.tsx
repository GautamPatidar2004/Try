import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, CreditCard, FileText, Wallet, Activity, RefreshCw } from "lucide-react";
import { FinancialStatsCard } from "./FinancialStatsCard";
import { RevenueChart } from "./RevenueChart";
import { TransactionTypeChart } from "./TransactionTypeChart";
import { TransactionsManagement } from "./TransactionsManagement";
import { EarningsManagement } from "./EarningsManagement";
import { PayoutsManagement } from "./PayoutsManagement";
import { InvoicesManagement } from "./InvoicesManagement";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FinancialDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: financialData, isLoading, refetch } = useFinancialData();
  const { toast } = useToast();

  const handleSyncStripe = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-stripe-data", {
        body: { limit: 100 },
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Synced ${data.synced} transactions, ${data.subscriptionsSynced || 0} subscriptions. Skipped ${data.skipped}.${data.hasMore ? " More data available." : ""}`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor revenue, transactions, and financial operations
          </p>
        </div>
        <Button onClick={handleSyncStripe} disabled={isSyncing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync from Stripe"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <TabsList className="inline-flex w-max min-w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FinancialStatsCard
              title="MRR"
              value={`$${financialData?.mrr?.toFixed(2) || '0.00'}`}
              icon={DollarSign}
              trend="up"
            />
            <FinancialStatsCard
              title="ARR"
              value={`$${financialData?.arr?.toFixed(2) || '0.00'}`}
              icon={TrendingUp}
            />
            <FinancialStatsCard
              title="Active Subscriptions"
              value={`${financialData?.activeSubscriptions || 0}`}
              icon={CreditCard}
            />
            <FinancialStatsCard
              title="Platform Fees (MTD)"
              value={`$${financialData?.platformFees.toFixed(2) || '0.00'}`}
              icon={TrendingUp}
            />
            <FinancialStatsCard
              title="Pending Payouts"
              value={`$${financialData?.pendingPayouts.toFixed(2) || '0.00'}`}
              icon={Wallet}
            />
            <FinancialStatsCard
              title="Transaction Volume"
              value={`${financialData?.transactionVolume || 0}`}
              icon={Activity}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <RevenueChart data={financialData?.monthlyMrr || []} />
            <TransactionTypeChart data={financialData?.revenueByType || {}} />
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsManagement />
        </TabsContent>

        <TabsContent value="earnings">
          <EarningsManagement />
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutsManagement />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
