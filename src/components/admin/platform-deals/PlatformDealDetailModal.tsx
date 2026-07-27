import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Loader2, 
  Save, 
  Users, 
  Play, 
  Pause, 
  XCircle, 
  Mail,
  User,
  DollarSign,
  FileText
} from "lucide-react";
import { format } from "date-fns";

import { PlatformDeal } from "./PlatformDealsManagement";

interface Application {
  id: string;
  status: string | null;
  created_at: string | null;
  influencer_id: string;
  cover_letter: string | null;
  influencers: {
    id: string;
    bio: string | null;
    profile_image_url: string | null;
    follower_count: number | null;
  } | null;
}

interface PlatformDealDetailModalProps {
  deal: PlatformDeal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlatformDealDetailModal = ({ deal, open, onOpenChange }: PlatformDealDetailModalProps) => {
  const queryClient = useQueryClient();
  const [editData, setEditData] = useState({
    campaign_title: deal.campaign_title,
    campaign_description: deal.campaign_description,
    budget_min: deal.budget_min?.toString() || "",
    budget_max: deal.budget_max?.toString() || "",
    spots_available: deal.spots_available?.toString() || "",
    priority_level: deal.priority_level || "medium",
    commission_rate: deal.commission_rate?.toString() || "15",
    contact_person: deal.contact_person || "",
    contact_email: deal.contact_email || "",
    internal_notes: deal.internal_notes || "",
  });

  const { data: applications, isLoading: loadingApplications } = useQuery({
    queryKey: ["platform-deal-applications", deal.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_campaign_applications")
        .select(`
          id,
          status,
          created_at,
          influencer_id,
          cover_letter,
          influencers (
            id,
            bio,
            profile_image_url,
            follower_count
          )
        `)
        .eq("campaign_id", deal.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Application[];
    },
    enabled: open,
  });

  const updateDeal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("brand_campaigns")
        .update({
          campaign_title: editData.campaign_title,
          campaign_description: editData.campaign_description,
          budget_min: editData.budget_min ? parseInt(editData.budget_min) : null,
          budget_max: editData.budget_max ? parseInt(editData.budget_max) : null,
          spots_available: editData.spots_available ? parseInt(editData.spots_available) : null,
          priority_level: editData.priority_level,
          commission_rate: editData.commission_rate ? parseFloat(editData.commission_rate) : null,
          contact_person: editData.contact_person || null,
          contact_email: editData.contact_email || null,
          internal_notes: editData.internal_notes || null,
        })
        .eq("id", deal.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deal updated successfully");
      queryClient.invalidateQueries({ queryKey: ["platform-deals"] });
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from("brand_campaigns")
        .update({ status: newStatus })
        .eq("id", deal.id);

      if (error) throw error;
    },
    onSuccess: (_, newStatus) => {
      toast.success(`Deal status changed to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["platform-deals"] });
      queryClient.invalidateQueries({ queryKey: ["platform-deals-stats"] });
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const { error } = await supabase
        .from("brand_campaign_applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application status updated");
      queryClient.invalidateQueries({ queryKey: ["platform-deal-applications", deal.id] });
      queryClient.invalidateQueries({ queryKey: ["platform-deals"] });
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={deal.brand_logo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {deal.brand_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{deal.campaign_title}</DialogTitle>
                <p className="text-sm text-muted-foreground">{deal.brand_name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {deal.status !== "open" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus.mutate("open")}
                  disabled={updateStatus.isPending}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Open
                </Button>
              )}
              {deal.status === "open" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus.mutate("paused")}
                  disabled={updateStatus.isPending}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
              {deal.status !== "closed" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateStatus.mutate("closed")}
                  disabled={updateStatus.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Close
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="applications">
              Applications ({applications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="internal">Internal</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Title</Label>
                <Input
                  value={editData.campaign_title}
                  onChange={(e) => setEditData({ ...editData, campaign_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Badge variant="outline" className="w-fit">
                  {deal.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editData.campaign_description}
                onChange={(e) => setEditData({ ...editData, campaign_description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Budget Min (€)</Label>
                <Input
                  type="number"
                  value={editData.budget_min}
                  onChange={(e) => setEditData({ ...editData, budget_min: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Budget Max (€)</Label>
                <Input
                  type="number"
                  value={editData.budget_max}
                  onChange={(e) => setEditData({ ...editData, budget_max: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Spots Available</Label>
                <Input
                  type="number"
                  value={editData.spots_available}
                  onChange={(e) => setEditData({ ...editData, spots_available: e.target.value })}
                />
              </div>
            </div>

            <Button 
              onClick={() => updateDeal.mutate()} 
              disabled={updateDeal.isPending}
              className="bg-hostfluencer-green hover:bg-hostfluencer-green/90"
            >
              {updateDeal.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            {loadingApplications ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={app.influencers?.profile_image_url || undefined} />
                            <AvatarFallback>
                              {app.influencer_id?.substring(0, 2).toUpperCase() || "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Influencer</p>
                            <p className="text-sm text-muted-foreground">
                              {app.influencers?.follower_count?.toLocaleString() || 0} followers
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{app.status}</Badge>
                          <Select
                            value={app.status || "pending"}
                            onValueChange={(value) => 
                              updateApplicationStatus.mutate({ applicationId: app.id, status: value })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {app.cover_letter && (
                        <p className="mt-2 text-sm text-muted-foreground border-t pt-2">
                          {app.cover_letter}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No applications yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="internal" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select
                  value={editData.priority_level}
                  onValueChange={(value) => setEditData({ ...editData, priority_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <Input
                  type="number"
                  value={editData.commission_rate}
                  onChange={(e) => setEditData({ ...editData, commission_rate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Person
                </Label>
                <Input
                  value={editData.contact_person}
                  onChange={(e) => setEditData({ ...editData, contact_person: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Email
                </Label>
                <Input
                  type="email"
                  value={editData.contact_email}
                  onChange={(e) => setEditData({ ...editData, contact_email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Internal Notes
              </Label>
              <Textarea
                value={editData.internal_notes}
                onChange={(e) => setEditData({ ...editData, internal_notes: e.target.value })}
                rows={4}
                placeholder="Notes visible only to admins..."
              />
            </div>

            <Button 
              onClick={() => updateDeal.mutate()} 
              disabled={updateDeal.isPending}
              className="bg-hostfluencer-green hover:bg-hostfluencer-green/90"
            >
              {updateDeal.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
