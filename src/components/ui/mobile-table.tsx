import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MobileTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    header: string;
    render?: (item: T) => ReactNode;
    hideOnMobile?: boolean;
    mobileLabel?: string;
  }[];
  keyExtractor: (item: T) => string;
  className?: string;
  emptyMessage?: string;
}

export function MobileTable<T>({ 
  data, 
  columns, 
  keyExtractor,
  className,
  emptyMessage = "No data available"
}: MobileTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((col) => (
                <th 
                  key={String(col.key)} 
                  className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="border-b hover:bg-muted/50 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-sm">
                    {col.render 
                      ? col.render(item) 
                      : String(item[col.key as keyof T] ?? '-')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <div 
            key={keyExtractor(item)} 
            className="bg-card border border-border rounded-lg p-4 space-y-2"
          >
            {columns
              .filter(col => !col.hideOnMobile)
              .map((col) => (
                <div key={String(col.key)} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {col.mobileLabel || col.header}
                  </span>
                  <span className="text-sm font-medium">
                    {col.render 
                      ? col.render(item) 
                      : String(item[col.key as keyof T] ?? '-')
                    }
                  </span>
                </div>
              ))
            }
          </div>
        ))}
      </div>
    </div>
  );
}
