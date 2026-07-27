import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load DnD Kit kanban board to reduce initial bundle
const CollaborationKanban = lazy(() => import('./CollaborationKanban'));

const KanbanSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    ))}
  </div>
);

export const KanbanBoardLazy = (props: any) => (
  <Suspense fallback={<KanbanSkeleton />}>
    <CollaborationKanban {...props} />
  </Suspense>
);
