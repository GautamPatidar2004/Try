import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, List } from "lucide-react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CollaborationCalendarProps {
  agreements: any[];
  onViewDetails: (agreement: any) => void;
}

const statusColors = {
  pending_host: { bg: "bg-orange-100", border: "border-orange-500", text: "text-orange-700" },
  pending_influencer: { bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-700" },
  active: { bg: "bg-green-100", border: "border-green-500", text: "text-green-700" },
  completed: { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-700" },
  cancelled: { bg: "bg-red-100", border: "border-red-500", text: "text-red-700" },
};

export const CollaborationCalendar = ({
  agreements,
  onViewDetails,
}: CollaborationCalendarProps) => {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const events = useMemo(() => {
    return agreements
      .filter((agreement) => agreement.application?.proposed_dates_start || agreement.application?.proposed_dates_end)
      .map((agreement) => {
        const hostName = agreement.host?.profiles?.first_name && agreement.host?.profiles?.last_name
          ? `${agreement.host.profiles.first_name} ${agreement.host.profiles.last_name}`
          : agreement.host?.profiles?.username || "Unknown Host";

        const influencerName = agreement.influencer?.profiles?.first_name && agreement.influencer?.profiles?.last_name
          ? `${agreement.influencer.profiles.first_name} ${agreement.influencer.profiles.last_name}`
          : agreement.influencer?.profiles?.username || "Unknown Influencer";

        const startDate = agreement.application?.proposed_dates_start
          ? new Date(agreement.application.proposed_dates_start)
          : new Date(agreement.created_at);
        const endDate = agreement.application?.proposed_dates_end
          ? new Date(agreement.application.proposed_dates_end)
          : startDate;

        return {
          id: agreement.id,
          title: `${hostName} × ${influencerName}`,
          start: startDate,
          end: endDate,
          resource: {
            status: agreement.status,
            property: agreement.application?.property?.title || "No Property",
            amount: agreement.agreed_rate,
            currency: agreement.currency,
            agreement,
          },
        };
      });
  }, [agreements]);

  const eventStyleGetter = (event: any) => {
    const colors = statusColors[event.resource.status as keyof typeof statusColors] || statusColors.pending_host;
    
    return {
      style: {
        backgroundColor: colors.bg.replace("bg-", "").replace("-100", ""),
        borderLeft: `4px solid ${colors.border.replace("border-", "").replace("-500", "")}`,
        color: colors.text.replace("text-", "").replace("-700", ""),
        borderRadius: "4px",
        padding: "2px 6px",
        fontSize: "0.875rem",
      },
    };
  };

  const handleSelectEvent = (event: any) => {
    onViewDetails(event.resource.agreement);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Calendar View</h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("month")}
              >
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("week")}
              >
                Week
              </Button>
              <Button
                variant={view === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("day")}
              >
                Day
              </Button>
              <Button
                variant={view === "agenda" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("agenda")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <span className="text-sm font-medium">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs">Pending Host</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs">Pending Influencer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs">Cancelled</span>
            </div>
          </div>

          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              popup
              tooltipAccessor={(event: any) => {
                const { property, amount, currency, status } = event.resource;
                return `${property} • ${status} • $${amount} ${currency?.toUpperCase() || 'USD'}`;
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationCalendar;
