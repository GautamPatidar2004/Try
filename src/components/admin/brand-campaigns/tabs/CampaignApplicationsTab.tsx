import { useGetCampaignApplications } from "@/hooks/useBrandCampaignApplications";
import { ApplicationCard } from "@/components/brands/ApplicationCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface CampaignApplicationsTabProps {
  campaignId: string;
}

export const CampaignApplicationsTab = ({ campaignId }: CampaignApplicationsTabProps) => {
  const { data: applications, isLoading, error, isError } = useGetCampaignApplications(campaignId);

  const stats = {
    total: applications?.length || 0,
    pending: applications?.filter(a => a.status === "pending").length || 0,
    accepted: applications?.filter(a => a.status === "accepted").length || 0,
    rejected: applications?.filter(a => a.status === "rejected").length || 0,
    invited: applications?.filter(a => a.status === "invited").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <XCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
          <p className="text-destructive text-sm font-medium">Failed to load applications</p>
          <p className="text-muted-foreground text-xs mt-1">{error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" /> {stats.total} Total</Badge>
        <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-200"><Clock className="h-3 w-3" /> {stats.pending} Pending</Badge>
        <Badge variant="outline" className="gap-1 text-green-600 border-green-200"><CheckCircle className="h-3 w-3" /> {stats.accepted} Accepted</Badge>
        <Badge variant="outline" className="gap-1 text-destructive border-destructive/20"><XCircle className="h-3 w-3" /> {stats.rejected} Rejected</Badge>
        {stats.invited > 0 && <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200">📩 {stats.invited} Invited</Badge>}
      </div>

      {/* Application list */}
      {applications && applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map(app => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No applications yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
