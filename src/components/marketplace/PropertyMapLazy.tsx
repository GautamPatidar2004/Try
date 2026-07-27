import { lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load mapbox to reduce initial bundle size (500KB+)
const PropertyMap = lazy(() => import('./PropertyMap'));

const MapSkeleton = () => (
  <Card className="h-full">
    <div className="relative h-full">
      <Skeleton className="h-full w-full rounded-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    </div>
  </Card>
);

export const PropertyMapLazy = (props: any) => (
  <Suspense fallback={<MapSkeleton />}>
    <PropertyMap {...props} />
  </Suspense>
);
