import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar, CheckCircle, XCircle, Eye } from "lucide-react";
import { ApplicationDetailModal } from "@/components/applications/ApplicationDetailModal";
import { Application } from "./useApplications";

interface ApplicationsTableProps {
  applications: Application[];
  onUpdateStatus: (applicationId: string, newStatus: string) => void;
}

const ApplicationsTable = ({ applications, onUpdateStatus }: ApplicationsTableProps) => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Influencer</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Host</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {app.influencers?.profiles?.first_name} {app.influencers?.profiles?.last_name}
                  </p>
                  {app.proposal_message && (
                    <p className="text-sm text-gray-600 truncate max-w-xs">
                      {app.proposal_message}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{app.properties?.title}</p>
                  <p className="text-sm text-gray-600">{app.properties?.location}</p>
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium">
                  {app.properties?.hosts?.profiles?.first_name} {app.properties?.hosts?.profiles?.last_name}
                </p>
              </TableCell>
              <TableCell>
                {app.proposed_dates_start && app.proposed_dates_end ? (
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(app.proposed_dates_start).toLocaleDateString()}
                    </div>
                    <div className="text-gray-600">
                      to {new Date(app.proposed_dates_end).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">Not specified</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(app.status || 'pending')}>
                  {app.status || 'pending'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getDeliveryStatusColor(app.content_delivery_status || 'pending')}>
                  {app.content_delivery_status || 'pending'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedApplication(app)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {app.status === 'pending' && (
                    <>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => onUpdateStatus(app.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onUpdateStatus(app.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {applications.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No applications found matching your criteria.</p>
        </div>
      )}

      <ApplicationDetailModal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onApprove={() => {
          if (selectedApplication) {
            onUpdateStatus(selectedApplication.id, 'approved');
            setSelectedApplication(null);
          }
        }}
        onReject={() => {
          if (selectedApplication) {
            onUpdateStatus(selectedApplication.id, 'rejected');
            setSelectedApplication(null);
          }
        }}
        applicationType="host"
      />
    </div>
  );
};

export default ApplicationsTable;
