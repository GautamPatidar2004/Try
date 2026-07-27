import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { CollaborationCard } from "./CollaborationCard";

interface KanbanColumnProps {
  status: string;
  agreements: any[];
  onViewDetails: (agreement: any) => void;
}

const statusConfig = {
  pending_host: { label: "Pending Host", color: "bg-orange-500" },
  pending_influencer: { label: "Pending Influencer", color: "bg-yellow-500" },
  active: { label: "Active", color: "bg-green-500" },
  completed: { label: "Completed", color: "bg-blue-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
};

const SortableCard = ({ agreement, onViewDetails }: { agreement: any; onViewDetails: (agreement: any) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: agreement.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CollaborationCard agreement={agreement} onViewDetails={onViewDetails} />
    </div>
  );
};

export const KanbanColumn = ({ status, agreements, onViewDetails }: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: "bg-gray-500" };

  return (
    <div className="flex flex-col h-full min-w-[300px] bg-muted/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${config.color}`} />
          <h3 className="font-semibold text-sm">{config.label}</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {agreements.length}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 overflow-y-auto min-h-[200px]"
      >
        <SortableContext
          items={agreements.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {agreements.map((agreement) => (
            <SortableCard
              key={agreement.id}
              agreement={agreement}
              onViewDetails={onViewDetails}
            />
          ))}
        </SortableContext>
        {agreements.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No {config.label.toLowerCase()} collaborations
          </div>
        )}
      </div>
    </div>
  );
};
