import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { MediaKitDoc, SectionId, SECTION_LABELS, DEFAULT_PAGE_ASSIGNMENTS } from './types';

interface Props {
  doc: MediaKitDoc;
  setDoc: (d: MediaKitDoc) => void;
}

export const SectionsPanel = ({ doc, setDoc }: Props) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = doc.sectionOrder.indexOf(active.id as SectionId);
    const newIndex = doc.sectionOrder.indexOf(over.id as SectionId);
    setDoc({ ...doc, sectionOrder: arrayMove(doc.sectionOrder, oldIndex, newIndex) });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={doc.sectionOrder} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {doc.sectionOrder.map((id) => (
            <Row
              key={id}
              id={id}
              enabled={doc.enabledSections[id]}
              page={(doc.pageAssignments?.[id] ?? DEFAULT_PAGE_ASSIGNMENTS[id])}
              onToggle={() =>
                setDoc({
                  ...doc,
                  enabledSections: {
                    ...doc.enabledSections,
                    [id]: !doc.enabledSections[id],
                  },
                })
              }
              onPageChange={(p) =>
                setDoc({
                  ...doc,
                  pageAssignments: {
                    ...(doc.pageAssignments || DEFAULT_PAGE_ASSIGNMENTS),
                    [id]: p,
                  },
                })
              }
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

const Row = ({
  id,
  enabled,
  page,
  onToggle,
  onPageChange,
}: {
  id: SectionId;
  enabled: boolean;
  page: 1 | 2;
  onToggle: () => void;
  onPageChange: (p: 1 | 2) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 px-2 py-2 rounded-md border bg-card ${isDragging ? 'shadow-lg' : ''} ${!enabled ? 'opacity-50' : ''}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 text-sm">{SECTION_LABELS[id]}</span>
      <div className="flex items-center rounded-md border overflow-hidden text-[10px]">
        <button
          onClick={() => onPageChange(1)}
          className={`px-1.5 py-0.5 ${page === 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
          title="Place on page 1"
        >
          P1
        </button>
        <button
          onClick={() => onPageChange(2)}
          className={`px-1.5 py-0.5 ${page === 2 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
          title="Place on page 2"
        >
          P2
        </button>
      </div>
      <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
        {enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  );
};