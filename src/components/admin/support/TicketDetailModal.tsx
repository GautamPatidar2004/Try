import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, User, Calendar, MessageSquare, Send } from "lucide-react";
import { SupportTicket, SupportTicketMessage } from "@/types/support";

interface TicketDetailModalProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (ticketId: string, status: string) => void;
  onUpdatePriority: (ticketId: string, priority: string) => void;
  onReply: (ticketId: string, message: string) => void;
  fetchMessages: (ticketId: string) => Promise<SupportTicketMessage[]>;
}

const TicketDetailModal = ({
  ticket,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onReply,
  fetchMessages,
}: TicketDetailModalProps) => {
  const [replyMessage, setReplyMessage] = useState("");
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticket && isOpen) {
      loadMessages();
    }
  }, [ticket, isOpen]);

  const loadMessages = async () => {
    if (!ticket) return;
    
    setLoading(true);
    const ticketMessages = await fetchMessages(ticket.id);
    setMessages(ticketMessages);
    setLoading(false);
  };

  const handleReply = async () => {
    if (!ticket || !replyMessage.trim()) return;

    await onReply(ticket.id, replyMessage);
    setReplyMessage("");
    await loadMessages();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Ticket #{ticket.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                  <p className="text-gray-600 mt-2">{ticket.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {(ticket as any).user?.first_name} {(ticket as any).user?.last_name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(ticket.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">Category:</span>
                  <span className="text-sm font-medium">
                    {ticket.category?.name || 'Uncategorized'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={ticket.status} 
                    onValueChange={(value) => onUpdateStatus(ticket.id, value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={ticket.priority} 
                    onValueChange={(value) => onUpdatePriority(ticket.id, value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Loading messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.is_admin_reply
                          ? 'bg-blue-50 border-l-4 border-blue-500 ml-8'
                          : 'bg-gray-50 border-l-4 border-gray-300 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {message.is_admin_reply ? 'Admin' : 
                            `${(message as any).user?.first_name} ${(message as any).user?.last_name}`}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{message.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No messages yet</p>
                )}
              </div>

              {/* Reply Form */}
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleReply}
                      disabled={!replyMessage.trim()}
                      className="bg-brand-green hover:bg-brand-green/90"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailModal;