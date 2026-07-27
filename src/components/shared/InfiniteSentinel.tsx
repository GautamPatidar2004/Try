import { useEffect, useRef } from "react";

interface InfiniteSentinelProps {
  /** Called when the sentinel scrolls into view. Should be stable (useCallback). */
  onLoadMore: () => void;
  /** Only observe while there is more to load and nothing is in flight. */
  enabled: boolean;
  /** Prefetch distance before the sentinel is actually reached. */
  rootMargin?: string;
}

/**
 * Invisible scroll sentinel. When it enters the viewport (within rootMargin),
 * it calls onLoadMore — used to append the next batch/page of a list so we never
 * render thousands of rows at once. Works with both client-side incremental
 * rendering and react-query fetchNextPage.
 */
export function InfiniteSentinel({
  onLoadMore,
  enabled,
  rootMargin = "600px",
}: InfiniteSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, onLoadMore, rootMargin]);
  return <div ref={ref} aria-hidden className="h-1 w-full" />;
}

export default InfiniteSentinel;
