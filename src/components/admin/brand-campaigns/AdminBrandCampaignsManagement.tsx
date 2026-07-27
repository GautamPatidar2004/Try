import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Search, BarChart3, DollarSign, Users, Pause, CheckCircle, FileText } from "lucide-react";
import { AdminCampaignCard, type BrandCampaign } from "./AdminCampaignCard";
import { AdminCreateCampaignModal } from "./AdminCreateCampaignModal";
import { AdminCampaignDetailModal } from "./AdminCampaignDetailModal";
import { useToggleCampaignStatus } from "@/hooks/useBrandCampaignMutations";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AdminBrandCampaignsManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<BrandCampaign | null>(null);
  const queryClient = useQueryClient();
  const toggleStatus = useToggleCampaignStatus();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["admin-brand-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_campaigns")
        .select("id, campaign_title, brand_name, brand_logo_url, campaign_image_url, campaign_description, compensation_type, budget_min, budget_max, status, spots_available, spots_filled, applications_count, views_count, created_at, brand_website, brand_description, campaign_type, campaign_brief_url, target_destination, min_followers, max_followers, min_engagement_rate, required_niches, required_platforms, deliverables, content_requirements, geo_focus, requirements, product_value, currency, timeline_start, timeline_end, application_deadline, visibility, affiliate_enabled, affiliate_percentage")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BrandCampaign[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brand_campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brand-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["brand-campaigns"] });
      toast({ title: "Campaign deleted" });
      setDeleteId(null);
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const filtered = campaigns?.filter(c => {
    const matchesSearch = !search || c.campaign_title.toLowerCase().includes(search.toLowerCase()) || c.brand_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || (c.status || "draft") === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: campaigns?.length || 0,
    open: campaigns?.filter(c => c.status === "open").length || 0,
    paused: campaigns?.filter(c => c.status === "paused").length || 0,
    closed: campaigns?.filter(c => c.status === "closed").length || 0,
    totalBudget: campaigns?.reduce((sum, c) => sum + (c.budget_max || c.budget_min || 0), 0) || 0,
    totalApps: campaigns?.reduce((sum, c) => sum + (c.applications_count || 0), 0) || 0,
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: BarChart3, color: "text-primary" },
    { label: "Open", value: stats.open, icon: CheckCircle, color: "text-green-600" },
    { label: "Paused", value: stats.paused, icon: Pause, color: "text-yellow-600" },
    { label: "Total Budget", value: `€${stats.totalBudget.toLocaleString()}`, icon: DollarSign, color: "text-blue-600" },
    { label: "Applications", value: stats.totalApps, icon: Users, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brand Campaigns</h1>
          <p className="text-sm text-muted-foreground">Manage all brand campaigns across the platform</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by title or brand..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No campaigns found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <AdminCampaignCard
              key={c.id}
              campaign={c}
              onToggleStatus={(id, status) => toggleStatus.mutate({ id, status })}
              onDelete={setDeleteId}
              onViewDetails={setSelectedCampaign}
              isUpdating={toggleStatus.isPending}
            />
          ))}
        </div>
      )}

      <AdminCreateCampaignModal open={createOpen} onOpenChange={setCreateOpen} />

      <AdminCampaignDetailModal
        campaign={selectedCampaign}
        open={!!selectedCampaign}
        onOpenChange={open => { if (!open) setSelectedCampaign(null); }}
        onDelete={id => { setDeleteId(id); setSelectedCampaign(null); }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the campaign and cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
