import { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the calendar component to reduce initial bundle size
const CollaborationCalendar = lazy(() => import('./CollaborationCalendar'));

const CalendarSkeleton = () => (
  <Card className="border-border/50">
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </CardContent>
  </Card>
);

export const CollaborationCalendarLazy = (props: any) => (
  <Suspense fallback={<CalendarSkeleton />}>
    <CollaborationCalendar {...props} />
  </Suspense>
);
