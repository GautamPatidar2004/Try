import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupport } from "@/hooks/useSupport";
import { formatDistanceToNow } from "date-fns";

const TicketList = () => {
  const { tickets, loading, fetchUserTickets } = useSupport();

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-muted text-foreground border-border';
      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading your support tickets...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>You haven't created any support tickets yet.</p>
        <p className="text-sm mt-2">Create a ticket to get help with any issues.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-medium">{ticket.subject}</CardTitle>
              <div className="flex gap-2">
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {ticket.description}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Created {formatDistanceToNow(new Date(ticket.created_at))} ago
              </span>
              {ticket.category && (
                <Badge variant="outline" className="text-xs">
                  {ticket.category.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TicketList;