import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Kanban, Table } from "lucide-react";
import { CollaborationAgreementsManagement } from "./CollaborationAgreementsManagement";
import { CollaborationCalendarLazy as CollaborationCalendar } from "./CollaborationCalendarLazy";
import { CollaborationKanban } from "./CollaborationKanban";
import { AgreementDetailModal } from "./AgreementDetailModal";
import { useAgreementsManagement } from "@/hooks/useAgreementsManagement";
import type { Tables } from "@/integrations/supabase/types";

type CollaborationAgreement = Tables<"collaboration_agreements">;

export const CollaborationManagerView = () => {
  const { agreements, isLoading, toggleAgreementStatus } = useAgreementsManagement();
  const [activeView, setActiveView] = useState<string>(() => {
    return localStorage.getItem("collaboration-view") || "table";
  });
  const [selectedAgreement, setSelectedAgreement] = useState<CollaborationAgreement | null>(null);

  useEffect(() => {
    localStorage.setItem("collaboration-view", activeView);
  }, [activeView]);

  const handleViewDetails = (agreement: CollaborationAgreement) => {
    setSelectedAgreement(agreement);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await toggleAgreementStatus(id, newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="table" className="flex items-center gap-2">
          <Table className="h-4 w-4" />
          Table
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Calendar
        </TabsTrigger>
        <TabsTrigger value="kanban" className="flex items-center gap-2">
          <Kanban className="h-4 w-4" />
          Kanban
        </TabsTrigger>
      </TabsList>

      <TabsContent value="table" className="mt-4">
        <CollaborationAgreementsManagement />
      </TabsContent>

      <TabsContent value="calendar" className="mt-4">
        <CollaborationCalendar
          agreements={agreements || []}
          onViewDetails={handleViewDetails}
        />
      </TabsContent>

      <TabsContent value="kanban" className="mt-4">
        <CollaborationKanban
          agreements={agreements || []}
          onViewDetails={handleViewDetails}
          onStatusChange={handleStatusChange}
        />
      </TabsContent>

      <AgreementDetailModal
        agreement={selectedAgreement}
        open={!!selectedAgreement}
        onOpenChange={(open) => !open && setSelectedAgreement(null)}
        onStatusChange={handleStatusChange}
      />
    </Tabs>
  );
};
