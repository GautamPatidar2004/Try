import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  submitted: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  revision_requested: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  upcoming: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  completed: "bg-muted text-muted-foreground",
  other: "bg-muted text-muted-foreground",
};

const LABELS: Record<string, string> = {
  pending: "Pending",
  submitted: "Submitted",
  approved: "Approved",
  revision_requested: "Revision requested",
  active: "Active",
  upcoming: "Upcoming",
  completed: "Completed",
  other: "—",
};

export const StayStatusPill = ({ status }: { status: string }) => (
  <Badge variant="secondary" className={cn("rounded-full border-0", STYLES[status] || STYLES.other)}>
    {LABELS[status] || status}
  </Badge>
);