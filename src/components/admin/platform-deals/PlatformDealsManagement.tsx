import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  RefreshCw, 
  Search, 
  Briefcase, 
  DollarSign, 
  Users, 
  TrendingUp,
  Building2,
  Target
} from "lucide-react";
import { PlatformDealCard } from "./PlatformDealCard";
import { CreatePlatformDealDialog } from "./CreatePlatformDealDialog";
import { PlatformDealDetailModal } from "./PlatformDealDetailModal";

export interface PlatformDeal {
  id: string;
  campaign_title: string;
  brand_name: string;
  brand_logo_url: string | null;
  campaign_description: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string | null;
  spots_available: number | null;
  spots_filled: number | null;
  applications_count: number | null;
  created_at: string | null;
  is_platform_managed: boolean | null;
  managed_by: string | null;
  internal_notes: string | null;
  priority_level: string | null;
  commission_rate: number | null;
  contact_person: string | null;
  contact_email: string | null;
}

export const PlatformDealsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<PlatformDeal | null>(null);

  const { data: deals, isLoading, refetch } = useQuery({
    queryKey: ["platform-deals", activeTab, searchTerm],
    queryFn: async (): Promise<PlatformDeal[]> => {
      const { data, error } = await supabase
        .from("brand_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      let filtered = (data || []).filter((d: any) => d.is_platform_managed === true);
      
      if (activeTab !== "all") {
        filtered = filtered.filter((d: any) => d.status === activeTab);
      }

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter((d: any) => 
          d.campaign_title?.toLowerCase().includes(search) || 
          d.brand_name?.toLowerCase().includes(search)
        );
      }

      return filtered as unknown as PlatformDeal[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["platform-deals-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brand_campaigns").select("*");
      if (error) throw error;

      const platformDeals = (data || []).filter((d: any) => d.is_platform_managed === true);
      return {
        totalDeals: platformDeals.length,
        activeDeals: platformDeals.filter((d: any) => d.status === "open").length,
        totalBudget: platformDeals.reduce((sum: number, d: any) => sum + (d.budget_max || d.budget_min || 0), 0),
        totalApplications: platformDeals.reduce((sum: number, d: any) => sum + (d.applications_count || 0), 0),
        totalPlacements: platformDeals.reduce((sum: number, d: any) => sum + (d.spots_filled || 0), 0),
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Deals</h1>
          <p className="text-muted-foreground">Manage brand partnerships sourced by the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-hostfluencer-green hover:bg-hostfluencer-green/90">
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Total Deals", value: stats?.totalDeals || 0, icon: Briefcase, bgClass: "bg-primary/10", textClass: "text-primary" },
          { label: "Active", value: stats?.activeDeals || 0, icon: TrendingUp, bgClass: "bg-green-500/10", textClass: "text-green-500" },
          { label: "Total Budget", value: `€${(stats?.totalBudget || 0).toLocaleString()}`, icon: DollarSign, bgClass: "bg-blue-500/10", textClass: "text-blue-500" },
          { label: "Applications", value: stats?.totalApplications || 0, icon: Users, bgClass: "bg-purple-500/10", textClass: "text-purple-500" },
          { label: "Placements", value: stats?.totalPlacements || 0, icon: Target, bgClass: "bg-orange-500/10", textClass: "text-orange-500" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgClass}`}>
                  <stat.icon className={`h-5 w-5 ${stat.textClass}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search deals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Card key={i} className="animate-pulse"><CardContent className="p-6 h-48" /></Card>)}
        </div>
      ) : deals && deals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => <PlatformDealCard key={deal.id} deal={deal} onClick={() => setSelectedDeal(deal)} />)}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No platform deals yet</h3>
            <p className="text-muted-foreground mb-4">Create your first platform-managed brand deal.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Deal</Button>
          </CardContent>
        </Card>
      )}

      <CreatePlatformDealDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      {selectedDeal && <PlatformDealDetailModal deal={selectedDeal} open={!!selectedDeal} onOpenChange={(open) => !open && setSelectedDeal(null)} />}
    </div>
  );
};
