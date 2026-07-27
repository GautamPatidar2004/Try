import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Camera, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { StayDeliverable } from "@/hooks/useStayDetail";
import { StayStatusPill } from "./StayStatusPill";

interface Props {
  agreementId: string;
  deliverables: StayDeliverable[];
  locked: boolean;
}

export const DeliverableTimeline = ({ agreementId, deliverables, locked }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Daily deliverables</CardTitle>
      </CardHeader>
      <CardContent>
        {locked ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lock className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Check in to unlock your daily content slots.</p>
          </div>
        ) : deliverables.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No deliverable slots have been generated yet.
          </p>
        ) : (
          <ol className="space-y-3">
            {deliverables.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold flex-shrink-0">
                    {d.day_number}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm capitalize">
                      Day {d.day_number} · {d.deliverable_type}
                    </p>
                    {d.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Due {format(new Date(d.due_date), "MMM d")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StayStatusPill status={d.status} />
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/creator/stays/${agreementId}/deliverables/${d.day_number}`}>
                      <Camera className="h-4 w-4 mr-1" />
                      {d.status === "pending" ? "Upload" : "View"}
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};