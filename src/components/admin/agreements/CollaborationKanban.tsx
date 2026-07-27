import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { CollaborationCard } from "./CollaborationCard";
import { StatusUpdateDialog } from "./StatusUpdateDialog";

interface CollaborationKanbanProps {
  agreements: any[];
  onViewDetails: (agreement: any) => void;
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
}

export const CollaborationKanban = ({
  agreements,
  onViewDetails,
  onStatusChange,
}: CollaborationKanbanProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: string;
    oldStatus: string;
    newStatus: string;
    agreement: any;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredAgreements = agreements.filter((agreement) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    const hostName = agreement.host?.profiles?.first_name && agreement.host?.profiles?.last_name
      ? `${agreement.host.profiles.first_name} ${agreement.host.profiles.last_name}`
      : agreement.host?.profiles?.username || "";
    
    const influencerName = agreement.influencer?.profiles?.first_name && agreement.influencer?.profiles?.last_name
      ? `${agreement.influencer.profiles.first_name} ${agreement.influencer.profiles.last_name}`
      : agreement.influencer?.profiles?.username || "";
    
    const propertyTitle = agreement.application?.property?.title || "";
    
    return (
      hostName.toLowerCase().includes(searchLower) ||
      influencerName.toLowerCase().includes(searchLower) ||
      propertyTitle.toLowerCase().includes(searchLower)
    );
  });

  const groupedAgreements = {
    pending_host: filteredAgreements.filter((a) => a.status === "pending_host"),
    pending_influencer: filteredAgreements.filter((a) => a.status === "pending_influencer"),
    active: filteredAgreements.filter((a) => a.status === "active"),
    completed: filteredAgreements.filter((a) => a.status === "completed"),
    cancelled: filteredAgreements.filter((a) => a.status === "cancelled"),
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeAgreement = agreements.find((a) => a.id === active.id);
    const newStatus = over.id as string;

    if (activeAgreement && activeAgreement.status !== newStatus) {
      const hostName = activeAgreement.host?.profiles?.first_name && activeAgreement.host?.profiles?.last_name
        ? `${activeAgreement.host.profiles.first_name} ${activeAgreement.host.profiles.last_name}`
        : activeAgreement.host?.profiles?.username || "Unknown Host";

      const influencerName = activeAgreement.influencer?.profiles?.first_name && activeAgreement.influencer?.profiles?.last_name
        ? `${activeAgreement.influencer.profiles.first_name} ${activeAgreement.influencer.profiles.last_name}`
        : activeAgreement.influencer?.profiles?.username || "Unknown Influencer";

      setPendingStatusChange({
        id: activeAgreement.id,
        oldStatus: activeAgreement.status,
        newStatus,
        agreement: { hostName, influencerName },
      });
      setDialogOpen(true);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (pendingStatusChange) {
      await onStatusChange(pendingStatusChange.id, pendingStatusChange.newStatus);
      setPendingStatusChange(null);
      setDialogOpen(false);
    }
  };

  const activeAgreement = agreements.find((a) => a.id === activeId);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by host, influencer, or property..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn
            status="pending_host"
            agreements={groupedAgreements.pending_host}
            onViewDetails={onViewDetails}
          />
          <KanbanColumn
            status="pending_influencer"
            agreements={groupedAgreements.pending_influencer}
            onViewDetails={onViewDetails}
          />
          <KanbanColumn
            status="active"
            agreements={groupedAgreements.active}
            onViewDetails={onViewDetails}
          />
          <KanbanColumn
            status="completed"
            agreements={groupedAgreements.completed}
            onViewDetails={onViewDetails}
          />
          <KanbanColumn
            status="cancelled"
            agreements={groupedAgreements.cancelled}
            onViewDetails={onViewDetails}
          />
        </div>

        <DragOverlay>
          {activeId && activeAgreement ? (
            <CollaborationCard
              agreement={activeAgreement}
              onViewDetails={onViewDetails}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {pendingStatusChange && (
        <StatusUpdateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={handleConfirmStatusChange}
          oldStatus={pendingStatusChange.oldStatus}
          newStatus={pendingStatusChange.newStatus}
          agreementDetails={pendingStatusChange.agreement}
        />
      )}
    </div>
  );
};

export default CollaborationKanban;
