import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, differenceInDays } from "date-fns";
import { CalendarDays, DollarSign, FileText, User, CheckCircle2, Clock, XCircle, Shield } from "lucide-react";
import { toast } from "sonner";

interface AgreementDetailModalProps {
  agreement: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (id: string, newStatus: string) => Promise<void>;
}

const statusConfig: Record<string, { label: string; color: string; bgClass: string }> = {
  pending_host: { label: "Pending Host", color: "bg-orange-500", bgClass: "bg-orange-100 text-orange-700 border-orange-300" },
  pending_influencer: { label: "Pending Influencer", color: "bg-yellow-500", bgClass: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  active: { label: "Active", color: "bg-green-500", bgClass: "bg-green-100 text-green-700 border-green-300" },
  completed: { label: "Completed", color: "bg-blue-500", bgClass: "bg-blue-100 text-blue-700 border-blue-300" },
  cancelled: { label: "Cancelled", color: "bg-red-500", bgClass: "bg-red-100 text-red-700 border-red-300" },
};

export const AgreementDetailModal = ({ agreement, open, onOpenChange, onStatusChange }: AgreementDetailModalProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!agreement) return null;

  const formatCurrency = (amount: number | null, currency: string = 'usd') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || { label: status, color: "bg-gray-500", bgClass: "bg-gray-100 text-gray-700" };
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusChange) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(agreement.id, newStatus);
      toast.success(`Status updated to ${statusConfig[newStatus]?.label || newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Get collaboration dates from application
  const stayStart = agreement.application?.proposed_dates_start;
  const stayEnd = agreement.application?.proposed_dates_end;
  const stayDuration = stayStart && stayEnd 
    ? differenceInDays(new Date(stayEnd), new Date(stayStart)) 
    : null;

  const statusInfo = getStatusInfo(agreement.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Agreement Details</DialogTitle>
            <Badge className={`${statusInfo.bgClass} border`}>
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Collaboration Stay Dates */}
            {stayStart && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Collaboration Stay Dates
                </h3>
                <p className="text-lg font-semibold">
                  {format(new Date(stayStart), 'MMM d')} - {stayEnd ? format(new Date(stayEnd), 'MMM d, yyyy') : 'TBD'}
                </p>
                {stayDuration && (
                  <p className="text-sm text-muted-foreground">
                    {stayDuration} night{stayDuration !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(agreement.created_at), 'PPP')}
                  </p>
                </div>
              </div>

              {agreement.agreed_at && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Agreed On</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(agreement.agreed_at), 'PPP')}
                    </p>
                  </div>
                </div>
              )}

              {agreement.deadline && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Content Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(agreement.deadline), 'PPP')}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Agreed Rate</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(agreement.agreed_rate, agreement.currency)}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="parties" className="space-y-4">
            <div className="space-y-4">
              {/* Host */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <h3 className="font-medium">Host</h3>
                  </div>
                  {agreement.host_signed_at ? (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Signed
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      Awaiting
                    </div>
                  )}
                </div>
                <p className="text-sm">
                  {agreement.host?.profiles?.first_name} {agreement.host?.profiles?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">@{agreement.host?.profiles?.username || 'N/A'}</p>
                {agreement.host_signed_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Signed on {format(new Date(agreement.host_signed_at), 'PPP')}
                  </p>
                )}
              </div>

              {/* Influencer */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <h3 className="font-medium">Influencer</h3>
                  </div>
                  {agreement.influencer_signed_at ? (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Signed
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <Clock className="h-4 w-4" />
                      Awaiting
                    </div>
                  )}
                </div>
                <p className="text-sm">
                  {agreement.influencer?.profiles?.first_name} {agreement.influencer?.profiles?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">@{agreement.influencer?.profiles?.username || 'N/A'}</p>
                {agreement.influencer_signed_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Signed on {format(new Date(agreement.influencer_signed_at), 'PPP')}
                  </p>
                )}
              </div>

              {/* Property */}
              {agreement.application?.property && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <h3 className="font-medium">Property</h3>
                  </div>
                  <p className="text-sm">{agreement.application.property.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {agreement.application.property.property_type}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Deliverables</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {agreement.deliverable_count || 0} deliverable(s) required
              </p>
            </div>

            {agreement.content_requirements && agreement.content_requirements.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Content Requirements</h3>
                <ul className="list-disc list-inside space-y-1">
                  {agreement.content_requirements.map((req: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {agreement.cancellation_policy && (
              <div>
                <h3 className="font-medium mb-2">Cancellation Policy</h3>
                <p className="text-sm text-muted-foreground">{agreement.cancellation_policy}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Agreed Rate:</span>
                  <span className="text-sm">{formatCurrency(agreement.agreed_rate, agreement.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Currency:</span>
                  <span className="text-sm uppercase">{agreement.currency || 'USD'}</span>
                </div>
                {agreement.affiliate_commission_rate && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Affiliate Commission:</span>
                    <span className="text-sm">{agreement.affiliate_commission_rate}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={`${statusInfo.bgClass} border`}>{statusInfo.label}</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Admin Actions Tab */}
          <TabsContent value="admin" className="space-y-4">
            {/* Signature Status Overview */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Contract Signing Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Host Signature:</span>
                  {agreement.host_signed_at ? (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {format(new Date(agreement.host_signed_at), 'PPP')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      Pending
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Influencer Signature:</span>
                  {agreement.influencer_signed_at ? (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {format(new Date(agreement.influencer_signed_at), 'PPP')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-yellow-600">
                      <Clock className="h-4 w-4" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Override */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Change Agreement Status</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Override the agreement status as an admin. Use with caution.
              </p>
              <Select 
                value={agreement.status} 
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_host">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      Pending Host Signature
                    </div>
                  </SelectItem>
                  <SelectItem value="pending_influencer">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Pending Influencer Signature
                    </div>
                  </SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Actions */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                {agreement.status !== "completed" && (
                  <Button 
                    size="sm"
                    onClick={() => handleStatusChange("completed")}
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Mark Completed
                  </Button>
                )}
                {agreement.status !== "active" && agreement.status !== "completed" && agreement.status !== "cancelled" && (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange("active")}
                    disabled={isUpdating}
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Force Activate
                  </Button>
                )}
                {agreement.status !== "cancelled" && (
                  <Button 
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusChange("cancelled")}
                    disabled={isUpdating}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel Agreement
                  </Button>
                )}
              </div>
            </div>

            {/* Agreement ID for reference */}
            <div className="text-xs text-muted-foreground">
              Agreement ID: <code className="bg-muted px-1 py-0.5 rounded">{agreement.id}</code>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
