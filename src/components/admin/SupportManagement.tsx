import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useSupportTickets } from "./support/useSupportTickets";
import SupportTicketsTable from "./support/SupportTicketsTable";
import TicketDetailModal from "./support/TicketDetailModal";
import { SupportTicket } from "@/types/support";

const SupportManagement = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const {
    tickets,
    loading,
    updateTicketStatus,
    updateTicketPriority,
    replyToTicket,
    fetchTicketMessages,
  } = useSupportTickets();

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedTicket(null);
  };

  // Calculate stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
  };

  const statCards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Open",
      value: stats.open,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Support Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Support Management</h2>
        {stats.urgent > 0 && (
          <Badge className="bg-red-100 text-red-800 px-3 py-1">
            {stats.urgent} Urgent Ticket{stats.urgent > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SupportTicketsTable
            tickets={tickets}
            onViewTicket={handleViewTicket}
            onUpdateStatus={updateTicketStatus}
            onUpdatePriority={updateTicketPriority}
          />
        </CardContent>
      </Card>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={detailModalOpen}
        onClose={handleCloseModal}
        onUpdateStatus={updateTicketStatus}
        onUpdatePriority={updateTicketPriority}
        onReply={replyToTicket}
        fetchMessages={fetchTicketMessages}
      />
    </div>
  );
};

export default SupportManagement;