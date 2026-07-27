import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

interface VirtualizedPropertyGridProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  /** Force a fixed column count (e.g. 1 for the mobile list). If omitted, columns
   *  are derived responsively from the container width + minColumnWidth. */
  columns?: number;
  minColumnWidth?: number; // px, used when `columns` is not provided
  gap?: number; // px
  estimateRowHeight?: number; // px, initial guess; real heights are measured
  className?: string;
}

/**
 * Window-scroll virtualized responsive grid. Only the rows near the viewport are
 * mounted, so a large result set stays smooth (constant DOM size) while keeping the
 * page's natural scroll. Small lists render fine too (few rows = all mounted).
 */
export function VirtualizedPropertyGrid<T>({
  items,
  getKey,
  renderItem,
  columns,
  minColumnWidth = 320,
  gap = 24,
  estimateRowHeight = 380,
  className,
}: VirtualizedPropertyGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(columns ?? 1);
  const [scrollMargin, setScrollMargin] = useState(0);

  // Responsive column count from container width (skipped when `columns` is fixed).
  useLayoutEffect(() => {
    if (columns) {
      setCols(columns);
      return;
    }
    const el = parentRef.current;
    if (!el) return;
    const recompute = () => {
      const w = el.clientWidth;
      setCols(Math.max(1, Math.floor((w + gap) / (minColumnWidth + gap))));
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [columns, minColumnWidth, gap]);

  // Offset of the grid from the top of the document, so the window virtualizer
  // aligns its row positions with page scroll.
  useEffect(() => {
    const measure = () => {
      const el = parentRef.current;
      if (el) setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items.length, cols]);

  const rowCount = Math.ceil(items.length / cols);
  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimateRowHeight,
    overscan: 4,
    scrollMargin,
  });

  return (
    <div ref={parentRef} className={className}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: "relative",
          width: "100%",
        }}
      >
        {virtualizer.getVirtualItems().map((row) => {
          const start = row.index * cols;
          const rowItems = items.slice(start, start + cols);
          return (
            <div
              key={row.key}
              data-index={row.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gap,
                  paddingBottom: gap,
                }}
              >
                {rowItems.map((item) => (
                  <div key={getKey(item)}>{renderItem(item)}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualizedPropertyGrid;
