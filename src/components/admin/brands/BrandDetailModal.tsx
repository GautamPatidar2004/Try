import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Mail, Phone, Globe, CheckCircle, XCircle, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAdminBrands } from "@/hooks/useAdminBrands";
import { BrandDocuments } from "./BrandDocuments";
import { BrandCampaigns } from "./BrandCampaigns";
import { EditBrandForm } from "./EditBrandForm";
import { format } from "date-fns";

interface BrandDetailModalProps {
  brandId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleVerification: (id: string, verified: boolean) => void;
}

export const BrandDetailModal = ({ 
  brandId, 
  open, 
  onOpenChange,
  onToggleVerification 
}: BrandDetailModalProps) => {
  const { getBrandById, getBrandCampaigns, updateBrand, deleteCampaign, updateCampaign } = useAdminBrands();
  const [isEditing, setIsEditing] = useState(false);

  const { data: brand, isLoading, refetch } = useQuery({
    queryKey: ["admin-brand-detail", brandId],
    queryFn: () => getBrandById(brandId!),
    enabled: !!brandId && open,
  });

  const { data: campaigns, refetch: refetchCampaigns } = useQuery({
    queryKey: ["admin-brand-campaigns", brand?.user_id],
    queryFn: () => getBrandCampaigns(brand!.user_id),
    enabled: !!brand?.user_id && open,
  });

  const handleSave = (updates: any) => {
    updateBrand.mutate(
      { id: brandId!, updates },
      {
        onSuccess: () => {
          setIsEditing(false);
          refetch();
        },
      }
    );
  };

  const handleEditCampaign = (campaign: any) => {
    const newTitle = prompt("Campaign Title:", campaign.campaign_title);
    if (newTitle) {
      updateCampaign.mutate(
        { id: campaign.id, updates: { campaign_title: newTitle } },
        { onSuccess: () => refetchCampaigns() }
      );
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    deleteCampaign.mutate(campaignId, {
      onSuccess: () => refetchCampaigns(),
    });
  };

  const handleToggleCampaignStatus = (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    updateCampaign.mutate(
      { id: campaignId, updates: { status: newStatus } },
      { onSuccess: () => refetchCampaigns() }
    );
  };

  if (!open || !brandId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Brand Management</DialogTitle>
          <DialogDescription>
            Complete brand information and management tools
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : brand ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="tools">Admin Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {!isEditing ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{brand.brand_name}</h3>
                      <p className="text-muted-foreground">{brand.company_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={brand.verified ? "default" : "secondary"}>
                        {brand.verified ? "Verified" : "Unverified"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  {brand.logo_url && (
                    <div className="flex justify-center p-4 bg-muted rounded-lg">
                      <img 
                        src={brand.logo_url} 
                        alt={brand.brand_name}
                        className="max-h-24 object-contain"
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{brand.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Industry</p>
                      <p className="font-medium capitalize">{brand.industry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Range</p>
                      <p className="font-medium capitalize">{brand.budget_range.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{format(new Date(brand.created_at), "MMM d, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{format(new Date(brand.updated_at), "MMM d, yyyy")}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{brand.contact_email}</span>
                      </div>
                      {brand.contact_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{brand.contact_phone}</span>
                        </div>
                      )}
                      {brand.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={brand.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {brand.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {(brand as any).profiles && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Brand Owner</h4>
                        <p className="text-sm">
                          {(brand as any).profiles.first_name} {(brand as any).profiles.last_name}
                          {(brand as any).profiles.username && ` (@${(brand as any).profiles.username})`}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1"
                      variant={brand.verified ? "outline" : "default"}
                      onClick={() => onToggleVerification(brand.id, !brand.verified)}
                    >
                      {brand.verified ? (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Unverify Brand
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify Brand
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <EditBrandForm
                  brand={brand}
                  onSave={handleSave}
                  onCancel={() => setIsEditing(false)}
                />
              )}
            </TabsContent>

            <TabsContent value="documents">
              <BrandDocuments brandId={brandId} />
            </TabsContent>

            <TabsContent value="campaigns">
              <BrandCampaigns 
                campaigns={campaigns || []}
                onEdit={handleEditCampaign}
                onDelete={handleDeleteCampaign}
                onToggleStatus={handleToggleCampaignStatus}
              />
            </TabsContent>

            <TabsContent value="financial">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Campaigns</p>
                    <p className="text-2xl font-bold">{campaigns?.length || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold">
                      {campaigns?.filter(c => c.status === "open").length || 0}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Additional financial tracking features coming soon...
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tools">
              <div className="space-y-4">
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                  <h4 className="font-semibold text-destructive mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Suspend or permanently delete this brand account
                  </p>
                  <div className="flex gap-3">
                    <Button variant="destructive" size="sm">
                      Suspend Account
                    </Button>
                    <Button variant="outline" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Admin Notes</h4>
                  <p className="text-sm text-muted-foreground">
                    Internal notes feature coming soon...
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-8 text-center text-muted-foreground">Brand not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
