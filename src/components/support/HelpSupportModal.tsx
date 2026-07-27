import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, FileText, Plus, Trash2 } from "lucide-react";
import { useSupport } from "@/hooks/useSupport";
import FAQAccordion from "./FAQAccordion";
import CreateTicketForm from "./CreateTicketForm";
import TicketList from "./TicketList";
import DeleteAccountTab from "./DeleteAccountTab";

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType?: 'host' | 'influencer' | 'brand' | 'restaurant_owner';
}

type TabType = 'faq' | 'tickets' | 'create' | 'delete';

const HelpSupportModal = ({ isOpen, onClose, userType = 'influencer' }: HelpSupportModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const { faqs, searchFAQs, fetchUserTickets } = useSupport();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      await searchFAQs(searchTerm);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'tickets') {
      fetchUserTickets();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {userType === 'host' ? 'Host Help & Support' : 
             userType === 'brand' ? 'Brand Help & Support' :
             userType === 'restaurant_owner' ? 'Restaurant Owner Help & Support' :
             'Help & Support'}
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b overflow-x-auto">
          <Button
            variant={activeTab === 'faq' ? 'default' : 'ghost'}
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            onClick={() => handleTabChange('faq')}
          >
            <FileText className="w-4 h-4" />
            FAQ
          </Button>
          <Button
            variant={activeTab === 'tickets' ? 'default' : 'ghost'}
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            onClick={() => handleTabChange('tickets')}
          >
            <MessageSquare className="w-4 h-4" />
            My Tickets
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'ghost'}
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            onClick={() => handleTabChange('create')}
          >
            <Plus className="w-4 h-4" />
            Create Ticket
          </Button>
          <Button
            variant={activeTab === 'delete' ? 'default' : 'ghost'}
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-destructive"
            onClick={() => handleTabChange('delete')}
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>

              {/* FAQ Results */}
              <FAQAccordion faqs={faqs} />
            </div>
          )}

          {activeTab === 'tickets' && <TicketList />}

          {activeTab === 'create' && (
            <CreateTicketForm onSuccess={() => handleTabChange('tickets')} />
          )}

          {activeTab === 'delete' && <DeleteAccountTab />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpSupportModal;