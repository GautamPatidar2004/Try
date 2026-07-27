import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreatePlatformDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePlatformDealDialog = ({ open, onOpenChange }: CreatePlatformDealDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    campaign_title: "",
    brand_name: "",
    campaign_description: "",
    budget_min: "",
    budget_max: "",
    spots_available: "",
    priority_level: "medium",
    commission_rate: "15",
    contact_person: "",
    contact_email: "",
    internal_notes: "",
    compensation_type: "paid",
    deliverables: [] as string[],
  });

  const createDeal = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("brand_campaigns").insert({
        campaign_title: formData.campaign_title,
        brand_name: formData.brand_name,
        campaign_description: formData.campaign_description,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
        spots_available: formData.spots_available ? parseInt(formData.spots_available) : null,
        priority_level: formData.priority_level,
        commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : null,
        contact_person: formData.contact_person || null,
        contact_email: formData.contact_email || null,
        internal_notes: formData.internal_notes || null,
        compensation_type: formData.compensation_type,
        deliverables: formData.deliverables,
        is_platform_managed: true,
        managed_by: user.user.id,
        status: "draft",
        created_by: user.user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Platform deal created successfully");
      queryClient.invalidateQueries({ queryKey: ["platform-deals"] });
      queryClient.invalidateQueries({ queryKey: ["platform-deals-stats"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create deal: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      campaign_title: "",
      brand_name: "",
      campaign_description: "",
      budget_min: "",
      budget_max: "",
      spots_available: "",
      priority_level: "medium",
      commission_rate: "15",
      contact_person: "",
      contact_email: "",
      internal_notes: "",
      compensation_type: "paid",
      deliverables: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Platform Deal</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Brand Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name *</Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                placeholder="e.g., Marriott Hotels"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign_title">Campaign Title *</Label>
              <Input
                id="campaign_title"
                value={formData.campaign_title}
                onChange={(e) => setFormData({ ...formData, campaign_title: e.target.value })}
                placeholder="e.g., Summer Travel Campaign"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign_description">Campaign Description *</Label>
            <Textarea
              id="campaign_description"
              value={formData.campaign_description}
              onChange={(e) => setFormData({ ...formData, campaign_description: e.target.value })}
              placeholder="Describe the campaign, goals, and what you're looking for..."
              rows={3}
            />
          </div>

          {/* Budget */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_min">Budget Min (€)</Label>
              <Input
                id="budget_min"
                type="number"
                value={formData.budget_min}
                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_max">Budget Max (€)</Label>
              <Input
                id="budget_max"
                type="number"
                value={formData.budget_max}
                onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                placeholder="2000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spots_available">Spots Available</Label>
              <Input
                id="spots_available"
                type="number"
                value={formData.spots_available}
                onChange={(e) => setFormData({ ...formData, spots_available: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>

          {/* Platform Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority_level">Priority Level</Label>
              <Select
                value={formData.priority_level}
                onValueChange={(value) => setFormData({ ...formData, priority_level: value })}
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
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                placeholder="15"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Brand contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="brand@example.com"
              />
            </div>
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <Label htmlFor="internal_notes">Internal Notes (Admin only)</Label>
            <Textarea
              id="internal_notes"
              value={formData.internal_notes}
              onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
              placeholder="Notes visible only to admins..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createDeal.mutate()}
            disabled={!formData.campaign_title || !formData.brand_name || !formData.campaign_description || createDeal.isPending}
            className="bg-hostfluencer-green hover:bg-hostfluencer-green/90"
          >
            {createDeal.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Deal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
