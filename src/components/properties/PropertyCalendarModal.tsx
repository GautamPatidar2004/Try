import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, RefreshCw, Link2, CheckCircle2, AlertCircle, ExternalLink, Clock } from "lucide-react";
import { usePropertyCalendar } from "@/hooks/usePropertyCalendar";
import { DayPicker } from "react-day-picker";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Property } from "@/types/properties";

interface PropertyCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

const PropertyCalendarModal = ({ isOpen, onClose, property }: PropertyCalendarModalProps) => {
  const [icalUrl, setIcalUrl] = useState("");
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [month, setMonth] = useState(new Date());

  const {
    events,
    propertyData,
    loading,
    syncing,
    updateIcalUrl,
    syncCalendar,
    getBlockedDates,
  } = usePropertyCalendar(property.id);

  useEffect(() => {
    if (propertyData) {
      setIcalUrl(propertyData.ical_url || "");
      setSyncEnabled(propertyData.ical_sync_enabled);
    }
  }, [propertyData]);

  const handleSaveUrl = async () => {
    const success = await updateIcalUrl(icalUrl, syncEnabled);
    if (success && icalUrl) {
      // Auto-sync after saving URL
      await syncCalendar(true);
    }
  };

  const handleSync = async () => {
    await syncCalendar(true);
  };

  const blockedDates = getBlockedDates();
  const hasCalendarSetup = !!propertyData?.ical_url;
  const lastSynced = propertyData?.ical_last_synced_at;

  const isValidIcalUrl = (url: string) => {
    return url.includes('.ics') || url.includes('ical') || url.includes('calendar');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-green" />
            Calendar Sync
          </DialogTitle>
          <DialogDescription>
            Sync your Airbnb or other booking calendar to show availability to creators
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* iCal URL Setup */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">iCal URL</Label>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="https://www.airbnb.com/calendar/ical/..."
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
                className="font-mono text-sm"
              />
              
              {icalUrl && !isValidIcalUrl(icalUrl) && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  This doesn't look like a valid iCal URL
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={syncEnabled}
                    onCheckedChange={setSyncEnabled}
                    id="sync-enabled"
                  />
                  <Label htmlFor="sync-enabled" className="text-sm">
                    Auto-sync daily
                  </Label>
                </div>

                <Button
                  onClick={handleSaveUrl}
                  disabled={!icalUrl || icalUrl === propertyData?.ical_url}
                  size="sm"
                >
                  Save URL
                </Button>
              </div>
            </div>

            {/* Help text */}
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p className="font-medium">How to find your iCal URL:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Airbnb:</strong> Listing → Pricing & availability → iCal → Export calendar</li>
                <li><strong>VRBO:</strong> Calendar → Import/Export → Export</li>
                <li><strong>Booking.com:</strong> Property → Calendar & Pricing → Sync Calendars</li>
              </ul>
              <a 
                href="https://www.airbnb.com/help/article/99" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand-green hover:underline mt-2"
              >
                Learn more <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Sync Status */}
          {hasCalendarSetup && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                {lastSynced ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Calendar synced</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
                        <span className="mx-1">•</span>
                        {events.length} events
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">Not synced yet</p>
                      <p className="text-xs text-muted-foreground">Click sync to fetch calendar data</p>
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={handleSync}
                disabled={syncing || loading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          )}

          {/* Calendar Preview */}
          {hasCalendarSetup && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Availability Calendar</h4>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300" />
                    <span>Blocked</span>
                  </div>
                </div>
              </div>

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
                  blocked: "!bg-red-100 !text-red-600 hover:!bg-red-100",
                }}
                classNames={{
                  months: "flex flex-col sm:flex-row gap-4",
                  month: "flex-1",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex-1 text-center",
                  row: "flex w-full mt-1",
                  cell: "text-center text-sm p-0 relative flex-1",
                  day: "h-8 w-8 p-0 font-normal mx-auto rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground font-semibold",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                }}
              />
            </div>
          )}

          {/* No Calendar Setup */}
          {!hasCalendarSetup && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No calendar connected</p>
              <p className="text-sm">Add your iCal URL above to sync your availability</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyCalendarModal;
