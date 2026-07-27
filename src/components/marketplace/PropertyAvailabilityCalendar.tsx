import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePropertyCalendar } from "@/hooks/usePropertyCalendar";
import { cn } from "@/lib/utils";

interface PropertyAvailabilityCalendarProps {
  propertyId: string;
  className?: string;
}

const PropertyAvailabilityCalendar = ({ propertyId, className }: PropertyAvailabilityCalendarProps) => {
  const [month, setMonth] = useState(new Date());
  const { propertyData, loading, getBlockedDates, events } = usePropertyCalendar(propertyId);

  const blockedDates = getBlockedDates();
  const hasCalendar = !!propertyData?.ical_url;
  const lastSynced = propertyData?.ical_last_synced_at;

  if (loading) {
    return (
      <div className={cn("p-4 border rounded-lg animate-pulse", className)}>
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  if (!hasCalendar) {
    return (
      <div className={cn("p-6 border rounded-lg bg-muted/30", className)}>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h4 className="font-medium">Availability</h4>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">Calendar not synced. Contact host for availability.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-card dark:bg-background rounded-lg shadow-sm">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold">Availability Calendar</h4>
              {lastSynced && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Synced {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-100 to-green-200 border border-green-300" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-100 to-red-200 border border-red-300" />
              <span className="text-muted-foreground">Booked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-4">
        <DayPicker
          mode="multiple"
          selected={blockedDates}
          month={month}
          onMonthChange={setMonth}
          numberOfMonths={2}
          disabled={{ before: new Date() }}
          modifiers={{
            blocked: blockedDates,
          }}
          modifiersClassNames={{
            blocked: "!bg-red-100 !text-red-600 hover:!bg-red-100 dark:!bg-red-900/30 dark:!text-red-400",
          }}
          classNames={{
            months: "flex flex-col sm:flex-row gap-4",
            month: "flex-1",
            caption: "flex justify-center pt-1 relative items-center mb-4",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex-1 text-center",
            row: "flex w-full mt-1",
            cell: "text-center text-sm p-0 relative flex-1",
            day: "h-8 w-8 p-0 font-normal mx-auto rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-default",
            day_selected: "bg-primary text-primary-foreground",
            day_today: "bg-accent text-accent-foreground font-semibold ring-1 ring-primary/30",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-30",
          }}
        />

        {/* Summary */}
        {events.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>
                {blockedDates.length} days blocked across {events.length} bookings
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyAvailabilityCalendar;
